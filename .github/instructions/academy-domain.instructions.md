---
applyTo: "apps/academy/domain/**/*"
---

The use cases and their tests to take as examples are in the "use-cases" directory. The models and their tests to take as examples are in the "models" directory. For the new use-cases use `Effect.fromGen` to improve readability. We use event-sourcing and TDD. We keep the tests co-located with the production code. We are using yarn as a package manager. The terminal is git-bash, so don't use paths with windows structure when running commands. If you need to import files do it with .js extension as default typescript configuration requires that. For tests we only use the tools in the package "@fabric/testing", do not use jest or vitest or anything else.
