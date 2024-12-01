import "dotenv/config";
import cron from "node-cron";
import path from "path";
import { readdirSync } from "fs";
import { pino } from "pino"

const logger = pino()
const jobDirectory = path.join(__dirname, "cron-jobs");
const files = readdirSync(jobDirectory);

async function jobCompleted(jobName, duration, args) {
  logger.info(`job [${jobName}] completed in ${duration}ms`);
}

function registerCron(jobName, schedule, job) {
  const cronFn = async () => {
    try {
      const jLogger = logger.child({ jobName })
      const start = Date.now()
      const args = await job(jLogger);
      const end = Date.now()
      jobCompleted(jobName, end-start, args);
    } catch (e) {
      logger.error({ jobName: jobName, error: e }, `Exception thrown by the Job`)
    }
  }
  cron.schedule(schedule, cronFn);
  logger.info(`Registering job [${jobName}]`)
}

const jobs = files.map((jobFileName) => ({
  jobFile: path.join(jobDirectory, jobFileName),
  jobName: jobFileName,
}));

jobs.map(async ({ jobFile, jobName }) => {
  const { default: { schedule, job } } = await import(jobFile);
  if (schedule && job) registerCron(jobName, schedule, job);
});
