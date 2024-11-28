import "dotenv/config";
import { getBlogs } from "../lib/utils";

getBlogs().then(console.log)