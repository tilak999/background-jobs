import { Logger } from "pino"
import { Job } from "../types/cron"
import { validateEnvParams } from "../lib/utils"

async function main(logger: Logger) {
    const { API_KEY, API_ENDPOINT } = validateEnvParams()
    const url = `${API_ENDPOINT}/api/management/checkExpiredSubscriptions`
    const options = {
        method: "GET",
        headers: { "x-api-key": API_KEY },
    }
    const result = await fetch(url, options)
    const data = await result.json()
    logger.info(data, "[checkExpiredSubscriptions] Cron executed with result")
}

export default {
    schedule: process.env.BACKUP_CRON || "0 * * * *",
    job: main,
} as Job
