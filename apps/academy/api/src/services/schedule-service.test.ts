import { Effect, seconds, timeout } from "@fabric/core";
import { describe, expect, fnMock, test } from "@fabric/testing";
import { AccessPolicy, Schedule, UseCase } from "@ulthar/academy-domain";
import { createServiceMocks } from "@ulthar/academy-domain/mocks";
import { ScheduleService } from "./schedule-service.js";

describe("Schedule Service", async () => {
  const fn = fnMock();
  const demoUseCase = new UseCase({
    name: "DemoUseCase",
    auth: AccessPolicy.System(),
    type: "command",
    effect: () => Effect.ok(0).tap(fn),
  });

  const services = await createServiceMocks();

  test("should run scheduled use cases", async () => {
    const service = new ScheduleService(services, [
      Schedule.everySecond(demoUseCase),
    ]);
    service.start();

    await timeout(seconds(2));

    await service.stop();

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
