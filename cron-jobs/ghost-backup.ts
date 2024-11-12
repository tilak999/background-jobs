import mysqldump from "mysqldump"
import fs from "fs"
import path from "path"

interface Blogs {
    id: string
    dataDirectory: string
    dbName: string
}

interface BackupRecordData {
    size: number
    status: "Running" | "Completed" | "Failed"
    endAt: Date
}

async function getBlogs(): Promise<{ data: Blogs[] }> {
    if (process.env.API_ENDPOINT) {
        const headers = new Headers()
        headers.set("x-api-key", process.env.API_KEY || "")
        const response = await fetch(process.env.API_ENDPOINT || "", {
            method: "GET",
            headers,
        })
        return response.json()
    }
    throw "API_ENDPOINT ENV var not set"
}

async function updateBackupRecord(id: string, data?: BackupRecordData) {
    if (process.env.API_ENDPOINT) {
        const headers = new Headers()
        headers.set("x-api-key", process.env.API_KEY || "")
        if (!data) {
            const response = await fetch(process.env.API_ENDPOINT, {
                method: "POST",
                headers,
                body: JSON.stringify({ id }),
            })
            return response.json()
        } else {
            const response = await fetch(process.env.API_ENDPOINT, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ id, ...data }),
            })
            return response.json()
        }
    }
    throw "API_ENDPOINT ENV var not set"
}

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
    const { DB_HOST, DB_USER, DB_PASSWORD } = process.env
    mysqldump({
        connection: {
            host: DB_HOST || "localhost",
            user: DB_USER || "root",
            password: DB_PASSWORD || "",
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
