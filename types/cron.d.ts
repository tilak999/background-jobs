import { Logger } from "pino"

export interface Job {
    schedule: string
    job: (Logger) => any
}
