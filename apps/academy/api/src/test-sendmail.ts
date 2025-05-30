import type { Email } from "@fabric/core";
import { Environment } from "@fabric/core";
import "dotenv/config";
import { EnvSchema } from "./environment.js";
import { createEmailTransport } from "./services/build-dependencies.js";
import { sendMail } from "./services/email-service.js";

const emailTarget = process.argv[2] as Email;
const env = new Environment(EnvSchema, process.env);
const transport = createEmailTransport({ env });

await sendMail(
  {
    env,
    emailTransport: transport,
  },
  {
    recipient: emailTarget,
    subject: "Test email",
    body: "This is a test email",
  },
).runOrThrow();
