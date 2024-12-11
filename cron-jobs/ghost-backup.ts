import mysqldump from "mysqldump"
import fs from "fs"
import path from "path"
import { zipDirectory } from "../lib/archiver"
import { Blogs, getBlogs, updateBackupRecord } from "../lib/utils"
import { Logger } from "pino"
import { Job } from "../types/cron"

interface BackupInterface {
    dataDir: string
    backupDir: string
    blog: Blogs
    logger: Logger
}

async function createBackup(input: BackupInterface) {
    let data: any = null
    const { dataDir, backupDir, blog, logger } = input
    const { dataDirectory, dbName, id } = blog
    const src = path.join(dataDir, dataDirectory)
    const tempDest = path.join("/tmp/", dataDirectory)
    if (!fs.existsSync(src)) throw `'${src}' directory not found`
    try {
        data = await updateBackupRecord(id)
        if (!data) throw "Failed to create backup entry via API"
        const finalDest = path.join(backupDir, data.id)
        fs.cpSync(src, path.join(tempDest, "ghost_content"), {
            recursive: true,
        })
        await createDump(path.join(tempDest, `database_dump.sql`), dbName)
        fs.mkdirSync(finalDest, { recursive: true })
        await zipDirectory(
            tempDest,
            `${path.join(finalDest, dataDirectory)}.zip`
        )
        return await updateBackupRecord(data.id, {
            size: 0,
            status: "Completed",
            endAt: new Date(),
        })
    } catch (error) {
        // log the error
        logger.error({ error }, "Exception triggered")
        if (data)
            return await updateBackupRecord(data.id, {
                size: 0,
                status: "Failed",
                endAt: new Date(),
            })
    } finally {
        // do clean up of old backup directory
        fs.rmSync(tempDest, { recursive: true, force: true })
    }
}

async function createDump(filepath, dbName) {
    const { DATABASE_USER, DATABASE_HOST, DATABASE_PASSWORD } = process.env
    return mysqldump({
        connection: {
            host: DATABASE_HOST || "localhost",
            user: DATABASE_USER || "root",
            password: DATABASE_PASSWORD || "",
            database: dbName,
        },
        dumpToFile: filepath,
    })
}

async function takeGhostBackup(logger: Logger) {
    const { DATA_DIRECTORY, BACKUP_DATA_DIRECTORY } = process.env
    if (DATA_DIRECTORY && BACKUP_DATA_DIRECTORY) {
        const blogs = await getBlogs()
        logger.info({ count: blogs.data.length }, "blogs data fetched")
        for (let i = 0; i < blogs.data.length; i++) {
            await createBackup({
                blog: blogs.data[i],
                logger,
                dataDir: DATA_DIRECTORY,
                backupDir: BACKUP_DATA_DIRECTORY,
            })
        }
    } else {
        throw Error(
            "ENV variable DATA_DIRECTORY, BACKUP_DATA_DIRECTORY not set"
        )
    }
}

export default {
    schedule: process.env.BACKUP_CRON || "0 0 * * *",
    job: takeGhostBackup,
} as Job
