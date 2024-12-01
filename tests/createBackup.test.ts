import "dotenv/config";
import backup from "../cron-jobs/ghost-backup"
import pino from "pino";

backup.job(pino()).then(console.log)