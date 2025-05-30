/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { Email } from "@fabric/core";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  fnMock,
  it,
  partialMock,
} from "@fabric/testing";
import {
  EmailQueueStatus,
  UserInvitedEvent,
  UserRole,
} from "@ulthar/academy-domain";
import type { MockedDependencies } from "@ulthar/academy-domain/mocks";
import { createServiceMocks } from "@ulthar/academy-domain/mocks";
import type { Transporter } from "nodemailer";
import { EmailTemplates } from "../email-templates.js";
import type { ApiEnvironment } from "../environment.js";
import { EmailQueueService, processQueuedEmails } from "./email-service.js";

describe("Email Service", () => {
  let transporter: Transporter;
  let deps: MockedDependencies;
  let env: ApiEnvironment;
  const originalSetTimeout = setTimeout;

  let emailQueueService: EmailQueueService;

  beforeEach(async () => {
    global.setTimeout = fnMock<any>(() => 42);
    global.clearTimeout = fnMock();

    transporter = partialMock<Transporter>({
      sendMail: (opts) => {
        if (opts.to === "failing-email") {
          return Promise.reject(new Error("Transporter failed"));
        }
        return Promise.resolve(void 0);
      },
    });

    env = partialMock<ApiEnvironment>({
      get: (key: string) => {
        if (key === "EMAIL_DELAY_MS") return 1000;
        return key as any;
      },
    });

    deps = await createServiceMocks();

    emailQueueService = new EmailQueueService({
      ...deps,
      env,
      emailTransport: transporter,
      templates: EmailTemplates,
    });

    emailQueueService.start();
  });

  afterEach(() => {
    emailQueueService.stop();
    global.setTimeout = originalSetTimeout;
  });

  it("should queue an email when a user invited event is received", async () => {
    const code = deps.crypto.generateRandomToken(4);
    const email = "demo-email@mail.com";

    await deps.events
      .append(
        "userInvites",
        UserInvitedEvent.from({
          id: deps.crypto.randomUUID(),
          streamId: deps.crypto.randomUUID(),
          payload: {
            code,
            email,
            role: UserRole.ADMIN,
          },
          version: 1,
        }),
      )
      .runOrThrow();

    // Verify email was queued
    const queuedEmails = await deps.state
      .from("emailQueue")
      .where({
        status: EmailQueueStatus.QUEUED,
      })
      .select()
      .runOrThrow();

    expect(queuedEmails.length).toBe(1);
    expect(queuedEmails[0].recipient).toBe(email);
    expect(queuedEmails[0].subject).toBe(
      "Ulthar Academy - Fuiste invitado a la plataforma",
    );
    expect(queuedEmails[0].body).toContain(code);

    // Verify the debounce was scheduled
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it("should batch multiple email events", async () => {
    // Generate three invite events
    for (let i = 0; i < 3; i++) {
      const code = deps.crypto.generateRandomToken(4);
      const email = `user${i}@example.com` as Email;

      await deps.events
        .append(
          "userInvites",
          UserInvitedEvent.from({
            id: deps.crypto.randomUUID(),
            streamId: deps.crypto.randomUUID(),
            payload: {
              code,
              email,
              role: UserRole.ADMIN,
            },
            version: 1,
          }),
        )
        .runOrThrow();
    }

    // Verify emails were queued
    const queuedEmails = await deps.state
      .from("emailQueue")
      .where({
        status: EmailQueueStatus.QUEUED,
      })
      .select()
      .runOrThrow();

    expect(queuedEmails.length).toBe(3);

    // Verify setTimeout was called only once (due to debounce)
    expect(setTimeout).toHaveBeenCalledTimes(3);
    expect(clearTimeout).toHaveBeenCalledTimes(2);
  });

  it("should process queued emails", async () => {
    // Generate a test email
    const code = deps.crypto.generateRandomToken(4);
    const email = "demo-email@mail.com";

    await deps.events
      .append(
        "userInvites",
        UserInvitedEvent.from({
          id: deps.crypto.randomUUID(),
          streamId: deps.crypto.randomUUID(),
          payload: {
            code,
            email,
            role: UserRole.ADMIN,
          },
          version: 1,
        }),
      )
      .runOrThrow();

    // Process the queue manually
    await processQueuedEmails({
      ...deps,
      env,
      emailTransport: transporter,
      templates: EmailTemplates,
    }).runOrThrow();

    // Verify email was sent
    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: "EMAIL_FROM",
      to: email,
      subject: "Ulthar Academy - Fuiste invitado a la plataforma",
      html: expect.stringContaining(code),
    });

    // Verify the email status was updated to SENT
    const processedEmails = await deps.state
      .from("emailQueue")
      .where({
        status: EmailQueueStatus.SENT,
      })
      .select()
      .runOrThrow();

    expect(processedEmails.length).toBe(1);
  });

  it("should mark emails as failed when sending fails", async () => {
    // Generate a test email
    const code = deps.crypto.generateRandomToken(4);
    const email = "failing-email" as Email;

    await deps.events
      .append(
        "userInvites",
        UserInvitedEvent.from({
          id: deps.crypto.randomUUID(),
          streamId: deps.crypto.randomUUID(),
          payload: {
            code,
            email,
            role: UserRole.ADMIN,
          },
          version: 1,
        }),
      )
      .runOrThrow();

    // Process the queue with the failing transporter
    await processQueuedEmails({
      ...deps,
      env,
      emailTransport: transporter,
      templates: EmailTemplates,
    }).runOrThrow();

    // Verify email status was updated to FAILED
    const failedEmails = await deps.state
      .from("emailQueue")
      .where({
        status: EmailQueueStatus.FAILED,
      })
      .select()
      .runOrThrow();

    expect(failedEmails).toHaveLength(1);
  });
});
