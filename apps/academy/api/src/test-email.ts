import "dotenv/config";

import { Environment } from "@fabric/core";
import { UserInvitedEvent, UserRole } from "@ulthar/academy-domain";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import {
  EmailTemplates,
  type EventNamesWithEmails,
} from "./email-templates.js";
import { EnvSchema } from "./environment.js";
import type { SendMailOptions } from "./services/email-service.js";
import {
  EmailSubscriptions,
  getEnvForEmails,
  type EmailServiceDeps,
} from "./services/email-service.js";

/**
 * Simple utility for testing email templates
 * Usage: yarn test-email [templateName]
 * Example: yarn test-email UserInvited
 */

async function main() {
  // Get template name from command line args
  const templateName = process.argv[2];

  if (!templateName || !Object.keys(EmailTemplates).includes(templateName)) {
    console.error(`
Please provide a valid template name. Available templates:
${Object.keys(EmailTemplates).join("\n")}

Usage: yarn test-email [templateName]
Example: yarn test-email UserInvited
`);
    process.exit(1);
  }

  // Create minimal dependencies needed for rendering
  const env = new Environment(EnvSchema, process.env);

  // Set up environment variables for testing
  process.env.FRONTEND_HOST =
    process.env.FRONTEND_HOST ?? "https://academy.example.com";
  process.env.SUPPORT_EMAIL =
    process.env.SUPPORT_EMAIL ?? "support@example.com";

  const mockDeps = {
    env,
    templates: EmailTemplates,
  } as EmailServiceDeps;

  try {
    // Generate mock data based on the template type
    const emailData = await generateMockEmailData(
      mockDeps,
      templateName as EventNamesWithEmails,
    );
    console.log("\n");

    console.log("Subject:", emailData.subject);

    console.log("\n");

    // Show environment variables used in templates
    console.log("Environment values used in template:");
    console.log(getEnvForEmails(env));

    // Save the HTML to a temporary file and open in browser
    await openEmailInBrowser(emailData.body);
  } catch (error) {
    console.error(
      "Error rendering template:",
      error instanceof Error ? error : String(error),
    );
    process.exit(1);
  }
}

/**
 * Generate mock data for a specific template
 */
async function generateMockEmailData(
  mockDeps: EmailServiceDeps,
  templateName: EventNamesWithEmails,
): Promise<SendMailOptions> {
  // Avoid using switch with string literals since TypeScript warns about unnecessary conditionals
  const handlers: Record<EventNamesWithEmails, () => Promise<SendMailOptions>> =
    {
      UserInvited: async () => {
        const mockEvent = UserInvitedEvent.from({
          id: randomUUID(),
          streamId: randomUUID(),
          payload: {
            code: "ABC123", // Sample invite code
            email: "test@example.com",
            role: UserRole.ADMIN,
          },
          version: 1,
        });
        const subscriptionFn = EmailSubscriptions.UserInvited;
        return await subscriptionFn(mockDeps, mockEvent).runOrThrow();
      },
    };

  const handler = handlers[templateName];

  return await handler();
}

/**
 * Save rendered HTML to a temporary file and open in the default browser
 */
async function openEmailInBrowser(htmlContent: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = join(tmpdir(), `email-preview-${timestamp}.html`);

  // Write HTML to a temporary file
  await writeFile(filePath, htmlContent, "utf-8");

  // Open the file in the default browser
  console.log(`\nOpening email template in your browser...`);

  const startCommand =
    process.platform === "win32"
      ? 'start ""'
      : process.platform === "darwin"
        ? "open"
        : "xdg-open";

  const { exec } = await import("child_process");
  exec(`${startCommand} "${filePath}"`, (error) => {
    if (error) {
      console.error(`Error opening browser: ${error.message}`);
      console.log(`You can manually open the file: ${filePath}`);
    }
  });
}

// Run the main function
main().catch(console.error);
