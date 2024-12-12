import "dotenv/config"
import cron from "../cron-jobs/check-resource-usage"
import Logger from "pino"

cron.job(Logger()).then(console.log)
