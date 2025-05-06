import { Effect, TaggedError } from "@fabric/core";
import type {
  DomainEventStore,
  DomainStateStore,
  UserInvitedEvent,
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
  recipient: string;
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
  UserInvited: sendInviteEmail,
};

export function subscribeToEmailEvents(deps: EmailServiceDeps) {
  const { events, templates } = deps;
  const eventNames = Object.keys(templates) as EventNamesWithEmails[];
  for (const eventName of eventNames) {
    events.subscribe(eventName, (event) =>
      Effect.fromGen(function* () {
        const sendMailOptions = yield* EmailSubscriptions[eventName](
          deps,
          event,
        );
        yield* sendMail(deps, sendMailOptions);
      }),
    );
  }
}

export function sendInviteEmail(
  { templates, env }: EmailServiceDeps,
  event: UserInvitedEvent,
) {
  const template = templates.UserInvited;
  const payload = {
    code: event.payload.code,
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
