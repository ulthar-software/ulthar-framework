import type {
  DomainEvent,
  Email,
  Environment,
  EventToType,
  UnexpectedError,
} from "@fabric/core";
import { Effect, TaggedError } from "@fabric/core";
import type {
  DomainEventStore,
  DomainStateStore,
  PasswordResetRequestedEvent,
  UserInvitedEvent,
} from "@ulthar/academy-domain";
import {
  EmailFailedEvent,
  EmailQueuedEvent,
  EmailQueueStatus,
  EmailSentEvent,
} from "@ulthar/academy-domain";
import type { Transporter } from "nodemailer";
import type {
  EmailTemplates,
  EventNamesWithEmails,
  EventsWithEmail,
} from "../email-templates.js";
import type { ApiEnvironment, EnvSchema } from "../environment.js";

export interface EmailServiceDeps {
  env: ApiEnvironment;
  state: DomainStateStore;
  events: DomainEventStore;
  emailTransport: Transporter;
  templates: EmailTemplates;
}

export interface SendMailOptions {
  recipient: Email;
  subject: string;
  body: string;
}

export type EventSubscriptionRecord = {
  [K in EventNamesWithEmails]: (
    deps: EmailServiceDeps,
    event: Extract<EventsWithEmail, { type: K }>,
  ) => Effect<SendMailOptions, UnexpectedError>;
};

export const EmailSubscriptions: EventSubscriptionRecord = {
  UserInvited: generateInviteEmail,
  PasswordResetRequested: generatePasswordResetEmail,
};

export class EmailQueueService {
  private emailProcessingTimeoutId: NodeJS.Timeout | null = null;
  constructor(private deps: EmailServiceDeps) {}

  start() {
    const { events, templates } = this.deps;
    const eventNames = Object.keys(templates) as EventNamesWithEmails[];
    const scheduleBatchEmailProcessing =
      this.scheduleBatchEmailProcessing.bind(this);
    for (const eventName of eventNames) {
      events.subscribe(
        "*",
        eventName,
        (event) => {
          const processEmailEvent = EmailSubscriptions[eventName] as (
            deps: EmailServiceDeps,
            event: EventsWithEmail,
          ) => Effect<SendMailOptions, UnexpectedError>;

          return processEmailEvent(this.deps, event as EventsWithEmail)
            .flatMap((sendMailOptions) =>
              queueEmail(this.deps, event, sendMailOptions),
            )
            .map(() => {
              scheduleBatchEmailProcessing();
            });
        },
        {
          callOnReplay: false,
        },
      );
    }
  }

  private scheduleBatchEmailProcessing() {
    const delayMs = this.deps.env.get("EMAIL_DELAY_MS");

    // Clear existing timeout if it exists
    if (this.emailProcessingTimeoutId) {
      clearTimeout(this.emailProcessingTimeoutId);
    }

    // Set a new timeout
    this.emailProcessingTimeoutId = setTimeout(() => {
      void processQueuedEmails(this.deps).runOrThrow();
    }, delayMs);
  }

  stop() {
    if (this.emailProcessingTimeoutId) {
      clearTimeout(this.emailProcessingTimeoutId);
      this.emailProcessingTimeoutId = null;
    }
  }
}

export function queueEmail(
  { events }: EmailServiceDeps,
  event: EventToType<DomainEvent>,
  { recipient, subject, body }: SendMailOptions,
): Effect<void, UnexpectedError> {
  return events
    .append(
      "emailQueue",
      EmailQueuedEvent.from({
        id: crypto.randomUUID(),
        streamId: crypto.randomUUID(),
        payload: {
          streamId: event.streamId,
          eventId: event.id,
          eventType: event.type,
          recipient,
          subject,
          body,
        },
        version: 1,
      }),
    )
    .discardValue();
}

export function processQueuedEmails(
  deps: EmailServiceDeps,
): Effect<void, EmailSendError | UnexpectedError> {
  return Effect.fromGen(function* () {
    const { state } = deps;

    // Get all queued emails
    const queuedEmails = yield* state
      .from("emailQueue")
      .where({
        status: EmailQueueStatus.QUEUED,
      })
      .select();

    for (const email of queuedEmails) {
      yield* sendMail(deps, {
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
      })
        .flatMap(() =>
          deps.events
            .append(
              "emailQueue",
              EmailSentEvent.from({
                id: crypto.randomUUID(),
                streamId: email.id,
                payload: {},
                version: email.version + 1,
              }),
            )
            .discardValue(),
        )
        .catchWithEffect((error) => {
          // Handle email send failure
          return deps.events
            .append(
              "emailQueue",
              EmailFailedEvent.from({
                id: crypto.randomUUID(),
                streamId: email.id,
                payload: { reason: error.message },
                version: email.version + 1,
              }),
            )
            .discardValue();
        });
    }
  });
}

export function generateInviteEmail(
  { templates, env }: EmailServiceDeps,
  event: UserInvitedEvent,
): Effect<SendMailOptions> {
  const template = templates.UserInvited;
  const payload = {
    code: event.payload.code,
    email: event.payload.email,
    env: getEnvForEmails(env),
  };

  return Effect.ok({
    recipient: event.payload.email,
    subject: template.subject(payload),
    body: template.body(payload),
  });
}

export function generatePasswordResetEmail(
  { templates, env, state }: EmailServiceDeps,
  event: PasswordResetRequestedEvent,
): Effect<SendMailOptions, UnexpectedError> {
  return Effect.fromGen(function* () {
    const template = templates.PasswordResetRequested;

    const user = yield* state
      .from("users")
      .where({ email: event.payload.email })
      .selectOneOrFail();

    const payload = {
      resetToken: event.payload.token,
      email: event.payload.email,
      userName: user.firstName,
      expiryDate: event.payload.expiresAt.formatDate("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: env.get("TZ"),
      }),
      expiryTime: event.payload.expiresAt.formatTime("es-AR", {
        hourCycle: "h23",
        second: undefined,
        timeZone: env.get("TZ"),
      }),
      env: getEnvForEmails(env),
    };

    return {
      recipient: event.payload.email,
      subject: template.subject(payload),
      body: template.body(payload),
    };
  });
}

export function sendMail(
  {
    env,
    emailTransport,
  }: {
    env: Environment<EnvSchema>;
    emailTransport: Transporter;
  },
  { recipient, subject, body }: SendMailOptions,
): Effect<void, EmailSendError> {
  return Effect.tryFrom(
    async () => {
      await emailTransport.sendMail({
        from: env.get("EMAIL_FROM"),
        to: recipient,
        subject,
        html: body,
      });
    },
    (e) => new EmailSendError(`Failed to send email: ${e}`),
  );
}

export function getEnvForEmails(env: ApiEnvironment) {
  return {
    FRONTEND_HOST: env.get("FRONTEND_HOST"),
    SUPPORT_EMAIL: env.get("SUPPORT_EMAIL"),
  };
}

export class EmailSendError extends TaggedError<"EmailSendError"> {
  constructor(message: string) {
    super("EmailSendError", message);
  }
}
