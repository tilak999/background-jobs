import "dotenv/config"
import cron from 'node-cron';
import { takeGhostBackup } from './cron-jobs/ghost-backup';

cron.schedule('*/1 * * * *', () => {
    takeGhostBackup()
});