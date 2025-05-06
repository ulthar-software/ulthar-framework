/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { beforeEach, describe, expect, it, partialMock } from "@fabric/testing";
import { UserInvitedEvent, UserRole } from "@ulthar/academy-domain";
import type { MockedDependencies } from "@ulthar/academy-domain/mocks";
import { createServiceMocks } from "@ulthar/academy-domain/mocks";
import type { Transporter } from "nodemailer";
import { EmailTemplates } from "../email-templates.js";
import type { ApiEnvironment } from "../environment.js";
import { subscribeToEmailEvents } from "./email-service.js";

describe("Email Service", () => {
  let transporter: Transporter;
  let deps: MockedDependencies;

  beforeEach(async () => {
    transporter = partialMock<Transporter>({
      sendMail: () => Promise.resolve(void 0),
    });

    const env = partialMock<ApiEnvironment>({
      get: (key: string) => key as any,
    });

    deps = await createServiceMocks();

    subscribeToEmailEvents({
      ...deps,
      env,
      emailTransport: transporter,
      templates: EmailTemplates,
    });
  });

  it("should respond to a user invited event", async () => {
    const code = deps.crypto.generateInviteCode();
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

    expect(transporter.sendMail).toHaveBeenCalledExactlyOnceWith({
      from: "EMAIL_FROM",
      to: email,
      subject: "Ulthar Academy - Fuiste invitado a la plataforma",
      html: expect.stringContaining(code),
    });
  });
});
