import type {
  PasswordResetRequestedEvent,
  UserInvitedEvent,
} from "@ulthar/academy-domain";
import type { TemplateDelegate } from "handlebars";
import { join } from "path";
import { compileFileTemplate, compileTemplate } from "./utils/templates.js";

export interface EmailTemplate {
  subject: TemplateDelegate;
  body: TemplateDelegate;
}

export const EmailTemplates = {
  UserInvited: {
    subject: compileTemplate(
      "Ulthar Academy - Fuiste invitado a la plataforma",
    ),
    body: await compileFileTemplate(
      join(import.meta.dirname, "../emails/invite-email.hbs"),
    ),
  },
  PasswordResetRequested: {
    subject: compileTemplate(
      "Ulthar Academy - Solicitud de restablecimiento de contraseña",
    ),
    body: await compileFileTemplate(
      join(import.meta.dirname, "../emails/password-reset.hbs"),
    ),
  },
} as const satisfies Record<EventNamesWithEmails, EmailTemplate>;

export type EmailTemplates = typeof EmailTemplates;

export type EventsWithEmail = UserInvitedEvent | PasswordResetRequestedEvent;

export type EventNamesWithEmails = EventsWithEmail["type"];
