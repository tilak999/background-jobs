import "dotenv/config"
import cron from "../cron-jobs/disable-expired-subscription"
import Logger from "pino"

cron.job(Logger()).then(console.log)
