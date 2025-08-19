#!/usr/bin/env tsx

import "dotenv/config";

import { Effect, type Email } from "@fabric/core";
import {
  UserNotFoundError,
  UserRole,
  UserRoleChangedEvent,
} from "@ulthar/academy-domain";
import { initializeDependencies } from "../services/build-dependencies.js";

interface SwitchRoleInput {
  email: Email;
  role: keyof typeof UserRole;
}

function printUsage() {
  console.log("Usage: yarn switch-role <email> <role>");
  console.log("");
  console.log("Arguments:");
  console.log("  email    - The email address of the user");
  console.log("  role     - The new role for the user");
  console.log("");
  console.log("Available roles:");
  console.log(`  ${Object.keys(UserRole).join(", ")}`);
  console.log("");
  console.log("Examples:");
  console.log("  yarn switch-role john.doe@example.com TEACHER");
  console.log("  yarn switch-role jane.smith@example.com ADMIN");
}

function isValidRole(role: string): role is keyof typeof UserRole {
  return Object.keys(UserRole).includes(role);
}

function parseArguments(): SwitchRoleInput {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    console.error("Error: Both email and role are required");
    console.log("");
    printUsage();
    process.exit(1);
  }

  if (!isValidRole(role)) {
    console.error(`Error: Invalid role '${role}'`);
    console.log("");
    printUsage();
    process.exit(1);
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`Error: Invalid email format '${email}'`);
    process.exit(1);
  }

  return { email: email as Email, role };
}

function switchUserRole(email: Email, newRole: keyof typeof UserRole) {
  const { state, events, crypto } = initializeDependencies();

  return Effect.fromGen(function* () {
    console.log(`Looking for user with email: ${email}`);

    // Find the user by email
    const user = yield* state
      .from("users")
      .where({ email })
      .selectOneOrFail()
      .mapError(() => new UserNotFoundError(email));

    console.log(
      `Found user: ${user.firstName} ${user.lastName} (${user.email})`,
    );
    console.log(`Current role: ${user.role}`);
    console.log(`New role: ${UserRole[newRole]}`);

    // Check if the role is already the same
    if (user.role === UserRole[newRole]) {
      console.log("⚠️  User already has this role. No changes needed.");
      return;
    }

    // Create the UserRoleChangedEvent
    const roleChangedEvent = UserRoleChangedEvent.from({
      id: crypto.randomUUID(),
      streamId: user.id,
      version: user.version + 1,
      payload: {
        role: UserRole[newRole],
        changedBy: crypto.randomUUID(), // Using a generated UUID as we're running this as a script
      },
    });

    console.log(`Appending UserRoleChangedEvent...`);

    // Append the event to the event store
    yield* events.append("users", roleChangedEvent);

    console.log(
      `✅ Successfully changed user role from ${user.role} to ${UserRole[newRole]}`,
    );
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (
    args.length === 0 ||
    args.includes("help") ||
    args.includes("--help") ||
    args.includes("-h")
  ) {
    printUsage();
    process.exit(0);
  }

  const { email, role } = parseArguments();

  try {
    await switchUserRole(email, role).runOrThrow();
    console.log("Operation completed successfully.");
  } catch (error) {
    console.error("Error switching user role:", error);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
