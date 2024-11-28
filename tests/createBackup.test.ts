import "dotenv/config";
import backup from "../cron-jobs/ghost-backup"

backup.job().then(console.log)