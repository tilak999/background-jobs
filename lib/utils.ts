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

export async function updateBackupRecord(id: string, data?: BackupRecordData) {
    if (process.env.API_ENDPOINT) {
        const headers = new Headers()
        headers.set("x-api-key", process.env.API_KEY || "")
        if (!data) {
            const response = await fetch(process.env.API_ENDPOINT + "/api/backup", {
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