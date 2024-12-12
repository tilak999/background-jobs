import "dotenv/config"
import cron from "../cron-jobs/reminder-mail-job"
import Logger from "pino"

cron.job(Logger()).then(console.log)
