import mysqldump from "mysqldump"
import fs from "fs"
import path from "path"
import { zipDirectory } from "../lib/archiver"
import { Blogs, getBlogs, updateBackupRecord } from "../lib/utils";

async function createBackup(blog: Blogs) {
    let data:any = null;
    try {
        const { dataDirectory, dbName, id } = blog
        const { DATA_DIRECTORY, BACKUP_DATA_DIRECTORY } = process.env
        const src = path.join(DATA_DIRECTORY || "", dataDirectory)
        if (fs.existsSync(src) && BACKUP_DATA_DIRECTORY) {
            data = await updateBackupRecord(id)
            if(!data) throw "Failed to create backup entry via API"
            const dest = path.join(BACKUP_DATA_DIRECTORY, dataDirectory)
            fs.cpSync(src, path.join(dest, "ghost_data"), { recursive: true })
            await createDump(path.join(dest, `database_dump.sql`), dbName)
            await zipDirectory(dest, BACKUP_DATA_DIRECTORY)
            await updateBackupRecord(data.id, {
                size: 0,
                status: "Completed",
                endAt: new Date(),
            })
        } else {
            throw `Src directory [${src}] or backup directory [${BACKUP_DATA_DIRECTORY}] not found!`
        }
    } catch (error) {
        console.log(error)
        if(data)
            await updateBackupRecord(data.id, {
                size: 0,
                status: "Failed",
                endAt: new Date(),
            })
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

async function takeGhostBackup() {
    const blogs = await getBlogs()
    for (let i = 0; i < blogs.data.length; i++) {
        await createBackup(blogs.data[i])
    }
}

export default {
    schedule: process.env.BACKUP_CRON || "0 0 23 * *",
    job: takeGhostBackup,
}
