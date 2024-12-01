import mysqldump from "mysqldump"
import fs from "fs"
import path from "path"
import { zipDirectory } from "../lib/archiver"
import { Blogs, getBlogs, updateBackupRecord } from "../lib/utils";
import { Logger } from "pino";

async function createBackup(blog: Blogs, logger: Logger) {
    const { DATA_DIRECTORY, BACKUP_DATA_DIRECTORY } = process.env
    if(DATA_DIRECTORY && BACKUP_DATA_DIRECTORY) {
        let data:any = null;
        try {
            const { dataDirectory, dbName, id } = blog
            const src = path.join(DATA_DIRECTORY, dataDirectory)
            const dest = path.join(BACKUP_DATA_DIRECTORY, dataDirectory)
            // do clean up of old backup directory
            fs.rmSync(dest, { recursive: true, force: true})
            if (fs.existsSync(src)) {
                data = await updateBackupRecord(id)
                if(!data) throw "Failed to create backup entry via API"
                fs.cpSync(src, path.join(dest, "ghost_data"), { recursive: true })
                await createDump(path.join(dest, `database_dump.sql`), dbName)
                await zipDirectory(dest, `${dest}.zip`)
                return await updateBackupRecord(data.id, {
                    size: 0,
                    status: "Completed",
                    endAt: new Date(),
                })
            } else {
                throw `Src directory [${src}] or backup directory [${BACKUP_DATA_DIRECTORY}] not found!`
            }
        } catch (error) {
            logger.error({error}, "Exception triggered")
            if(data)
                return await updateBackupRecord(data.id, {
                    size: 0,
                    status: "Failed",
                    endAt: new Date(),
                })
        }
    } else {
        throw Error("ENV variable DATA_DIRECTORY, BACKUP_DATA_DIRECTORY not set")
    }
}

function createDump(filepath, dbName) {
    const { DATABASE_USER, DATABASE_HOST, DATABASE_PASSWORD } = process.env
    mysqldump({
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
    const blogs = await getBlogs()
    logger.info({ count: blogs.data.length}, "blogs data fetched")
    for (let i = 0; i < blogs.data.length; i++) {
        await createBackup(blogs.data[i], logger)
    }
}

export default {
    schedule: process.env.BACKUP_CRON || "0 0 23 * *",
    job: takeGhostBackup,
}
