import type { Email, UnexpectedError, UUID } from "@fabric/core";
import { Effect, TaggedError } from "@fabric/core";
import type {
  DomainEventStore,
  DomainStateStore,
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
import type { ApiEnvironment } from "../environment.js";

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
  ) => Effect<SendMailOptions>;
};

export const EmailSubscriptions: EventSubscriptionRecord = {
  UserInvited: generateInviteEmail,
};

export class EmailQueueService {
  private emailProcessingTimeoutId: NodeJS.Timeout | null = null;
  constructor(private deps: EmailServiceDeps) {
    const { events, templates } = deps;
    const eventNames = Object.keys(templates) as EventNamesWithEmails[];
    const scheduleBatchEmailProcessing =
      this.scheduleBatchEmailProcessing.bind(this);
    for (const eventName of eventNames) {
      events.subscribe(
        eventName,
        (event) =>
          EmailSubscriptions[eventName](deps, event)
            .flatMap((sendMailOptions) =>
              queueEmail(deps, event.type, event.id, sendMailOptions),
            )
            .map(() => {
              scheduleBatchEmailProcessing(deps);
            }),
        {
          callOnReplay: false,
        },
      );
    }
  }

  private scheduleBatchEmailProcessing(deps: EmailServiceDeps) {
    const delayMs = deps.env.get("EMAIL_DELAY_MS");

    // Clear existing timeout if it exists
    if (this.emailProcessingTimeoutId) {
      clearTimeout(this.emailProcessingTimeoutId);
    }

    // Set a new timeout
    this.emailProcessingTimeoutId = setTimeout(() => {
      this.emailProcessingTimeoutId = null;
      void processQueuedEmails(deps).runOrThrow();
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
  eventType: string,
  eventId: UUID,
  { recipient, subject, body }: SendMailOptions,
): Effect<void, UnexpectedError> {
  return events
    .append(
      "emailQueue",
      EmailQueuedEvent.from({
        id: crypto.randomUUID(),
        streamId: crypto.randomUUID(),
        payload: {
          eventId,
          eventType,
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
) {
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

export function sendMail(
  { env, emailTransport }: EmailServiceDeps,
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
