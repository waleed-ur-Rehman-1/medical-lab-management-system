import express from 'express';
import Result from '../models/Result.js';
import WhatsAppMessage from '../models/WhatsAppMessage.js';
import { sendReportReady, isWhatsAppConfigured } from '../services/whatsapp.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/send-report/:resultId', protect, authorize('admin', 'technician'), async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.resultId)
      .populate('patient')
      .populate('test', 'testName');
    if (!result) return res.status(404).json({ message: 'Result not found' });
    if (result.status !== 'approved')
      return res.status(400).json({ message: 'Only approved results can be sent' });

    const patient = result.patient;
    if (!patient) return res.status(400).json({ message: 'Patient not found on result' });

    const phone = patient.whatsappNumber || patient.contactNumber;
    if (!phone) return res.status(400).json({ message: 'Patient has no WhatsApp or contact number' });

    const base = process.env.REPORT_BASE_URL || 'http://localhost:5173/print/result';
    const reportUrl = `${base}/${result._id}`;

    const record = await WhatsAppMessage.create({
      patient: patient._id,
      report: result._id,
      phone,
      reportUrl,
      status: 'queued'
    });

    // ─── Not configured AND not mock → fail the record cleanly ───
    if (!isWhatsAppConfigured()) {
      record.status = 'failed';
      record.error =
        'WhatsApp not configured. Set WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID, or enable WHATSAPP_MOCK_MODE=true';
      await record.save();
      return res.status(503).json({
        message: record.error,
        record
      });
    }

    // ─── Attempt send ───
    try {
      const waResp = await sendReportReady(phone, patient.fullName, reportUrl, result.test?.testName);

      record.providerMessageId = waResp?.messages?.[0]?.id;

      // In mock mode, skip straight to 'delivered' so UI looks realistic
      record.status = waResp?._mock ? 'delivered' : 'sent';

      await record.save();
      res.json({
        success: true,
        mock: !!waResp?._mock,
        record
      });
    } catch (waErr) {
      record.status = 'failed';
      record.error = waErr?.response?.data?.error?.message || waErr.message;
      await record.save();
      res.status(502).json({
        message: 'WhatsApp send failed',
        error: record.error,
        record
      });
    }
  } catch (err) { next(err); }
});

router.get('/messages', protect, authorize('admin'), async (_req, res, next) => {
  try {
    const messages = await WhatsAppMessage.find()
      .populate('patient', 'mrNumber fullName')
      .populate('report', 'test')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(messages);
  } catch (err) { next(err); }
});

// Webhook verification — Meta calls this once during setup
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (mode === 'subscribe' && token && expected && token === expected) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Webhook events — status updates (sent/delivered/read/failed)
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    if (body?.object === 'whatsapp_business_account' && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          const statuses = change.value?.statuses || [];
          for (const st of statuses) {
            if (!st.id) continue;
            const patch = { status: st.status };
            if (st.errors && st.errors.length) {
              patch.error = st.errors.map((e) => e.title || e.message).join('; ');
            }
            await WhatsAppMessage.findOneAndUpdate(
              { providerMessageId: st.id },
              patch
            ).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.error('WA webhook error:', err.message);
  }
  res.sendStatus(200);
});

export default router;