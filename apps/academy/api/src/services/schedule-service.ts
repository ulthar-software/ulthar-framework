import { Effect } from "@fabric/core";
import {
  SystemAccess,
  type DomainDependencies,
  type ScheduledUseCase,
} from "@ulthar/academy-domain";
import { CronJob } from "cron";

export class ScheduleService {
  private cronJobs: CronJob[] = [];
  constructor(
    private deps: DomainDependencies,
    private scheduledUseCases: ScheduledUseCase[],
  ) {}

  start(): void {
    for (const scheduledUseCase of this.scheduledUseCases) {
      const job = new CronJob(scheduledUseCase.cronExpression, async () => {
        await scheduledUseCase.useCase
          .call(
            {
              ...this.deps,
              currentUser: SystemAccess,
            },
            {},
          )
          .tapError((error) => {
            console.error(
              `Error running scheduled use case ${scheduledUseCase.useCase.name}:`,
              error,
            );
          })
          .catchAll(() => Effect.ok())
          .run();
      });
      job.start();
      this.cronJobs.push(job);
    }
  }

  async stop(): Promise<void> {
    for (const job of this.cronJobs) {
      await job.stop();
    }
    this.cronJobs = [];
  }
}
