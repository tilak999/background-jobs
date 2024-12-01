export interface Blogs {
    id: string
    dataDirectory: string
    dbName: string
}

export async function getBlogs(): Promise<{ data: Blogs[] }> {
    if (process.env.API_ENDPOINT) {
        const url = (process.env.API_ENDPOINT  || "") + "/api/blogs"
        const headers = new Headers()
        headers.set("x-api-key", process.env.API_KEY || "")
        const response = await fetch(url, {
            method: "GET",
            headers,
        })
        return response.json()
    }
    throw "API_ENDPOINT ENV var not set"
}

export interface BackupRecordData {
    size: number
    status: "Running" | "Completed" | "Failed"
    endAt: Date
}

async function addStartOfBackupEntry(id: string) {
    const endpoint = process.env.API_ENDPOINT + "/api/backup"
    const headers = new Headers()
    headers.set("x-api-key", process.env.API_KEY || "")
    const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ id }),
    })
    return response.json()
}

async function addEndOfBackupEntry(id: string, data: BackupRecordData) {
    const endpoint = process.env.API_ENDPOINT + "/api/backup"
    const headers = new Headers()
    headers.set("x-api-key", process.env.API_KEY || "")
    const response = await fetch(endpoint, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id, ...data }),
    })
    return response.json()
}

export async function updateBackupRecord(id: string, data?: BackupRecordData) {
    if (!process.env.API_ENDPOINT) throw "API_ENDPOINT ENV var not set"
    const response = data ? await addEndOfBackupEntry(id, data) : await addStartOfBackupEntry(id)
    if(response.error) {
        throw Error(JSON.stringify(response.error))
    }
    return response.data
}