import "dotenv/config";
import cron from "node-cron";
import path from "path";
import { readdirSync } from "fs";

const jobDirectory = path.join(__dirname, "cron-jobs");
const files = readdirSync(jobDirectory);

async function jobCompleted(jobName, duration, args) {
  console.log(`job [${jobName}] completed in ${duration}ms`);
}

function registerCron(jobName, schedule, job) {
  const cronFn = async () => {
    try {
      const start = Date.now()
      const args = await job();
      const end = Date.now()
      jobCompleted(jobName, end-start, args);
    } catch (e) {
      console.log(e);
    }
  }
  cron.schedule(schedule, cronFn);
}

const jobs = files.map((jobFileName) => ({
  jobFile: path.join(jobDirectory, jobFileName),
  jobName: jobFileName,
}));

jobs.map(async ({ jobFile, jobName }) => {
  const {
    default: { schedule, job },
  } = await import(jobFile);
  if (schedule && job) registerCron(jobName, schedule, job);
});
