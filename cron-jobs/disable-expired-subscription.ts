import { Logger } from "pino"
import { Job } from "../types/cron"

async function main(logger: Logger) {
    const url = `${process.env.API_ENDPOINT}/api/management/checkExpiredSubscriptions`
    const options = {
        method: "GET",
        headers: { "x-api-key": process.env.API_KEY || "" },
    }
    const result = await fetch(url, options)
    const data = await result.json()
    logger.info(data, "[checkExpiredSubscriptions] Cron executed with result")
}

export default {
    schedule: process.env.BACKUP_CRON || "0 * * * *",
    job: main,
} as Job
