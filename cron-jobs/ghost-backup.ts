export async function takeGhostBackup() {
    const blogs = await fetch(process.env.TYPETALE_URL + "/api/blogs")
    console.log(blogs)
}