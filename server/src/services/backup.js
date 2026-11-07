import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';

const execAsync = promisify(exec);
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

export async function runBackup() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archive = path.join(BACKUP_DIR, `backup-${stamp}.archive.gz`);
  const uri = process.env.MONGO_URI;
  await execAsync(
    `mongodump --uri="${uri}" --archive="${archive}" --gzip`
  );
  console.log(`✅ Backup created: ${archive}`);
  return archive;
}

export function scheduleBackups() {
  // Daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try { await runBackup(); } catch (e) { console.error('Backup failed', e.message); }
  });
  console.log('⏰ Backup cron scheduled (daily 2 AM)');
}