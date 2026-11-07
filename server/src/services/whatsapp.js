import axios from 'axios';

const META_API = 'https://graph.facebook.com/v20.0';

export function isWhatsAppConfigured() {
  if (String(process.env.WHATSAPP_MOCK_MODE).toLowerCase() === 'true') return true;
  return !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export function isMockMode() {
  return String(process.env.WHATSAPP_MOCK_MODE).toLowerCase() === 'true';
}

export async function sendReportReady(toPhone, patientName, reportUrl, testName) {
  // ─── Mock mode ───
  if (isMockMode()) {
    console.log(`🎭 [MOCK WhatsApp] to=${toPhone} patient=${patientName} test=${testName} url=${reportUrl}`);
    await new Promise(r => setTimeout(r, 400));   // simulate network
    return {
      messaging_product: 'whatsapp',
      messages: [{ id: `MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` }],
      _mock: true
    };
  }

  // ─── Real mode ───
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID, or set WHATSAPP_MOCK_MODE=true for testing.');
  }

  const normalized = String(toPhone || '').replace(/[^\d]/g, '');
  if (!normalized || normalized.length < 8) throw new Error('Invalid phone number');

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'lab_report_ready';
  const langCode = process.env.WHATSAPP_TEMPLATE_LANG || 'en_US';

  const payload = {
    messaging_product: 'whatsapp',
    to: normalized,
    type: 'template',
    template: {
      name: templateName,
      language: { code: langCode },
      components: [{
        type: 'body',
        parameters: [
          { type: 'text', text: patientName || 'Patient' },
          { type: 'text', text: testName || 'Lab Report' },
          { type: 'text', text: reportUrl }
        ]
      }]
    }
  };

  const resp = await axios.post(
    `${META_API}/${phoneNumberId}/messages`,
    payload,
    { headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` } }
  );
  return resp.data;
}