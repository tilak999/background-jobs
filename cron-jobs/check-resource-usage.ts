import { Logger } from "pino"
import { Job } from "../types/cron"

async function main(logger: Logger) {
    const url = `${process.env.API_ENDPOINT}/api/management/checkResourceUsage`
    const options = {
        method: "GET",
        headers: { "x-api-key": process.env.API_KEY || "" },
    }
    const result = await fetch(url, options)
    const data = await result.json()
    logger.info(data, "[checkResourceUsage] Cron executed with result")
}

export default {
    schedule: process.env.BACKUP_CRON || "*/3 * * * *",
    job: main,
} as Job