---
applyTo: "apps/academy/api/**/*"
---

The domain exists in the academy/domain directory and you can import it using "@ulthar/academy-domain". The project is a web API. We use event-sourcing and TDD. We keep the tests co-located with the production code. We are using yarn as a package manager. The terminal is git-bash, so don't use paths with windows structure when running commands. If you need to import files do it with .js extension. For tests we only use the tools in @fabric/testing. Don't mock dependencies as this services must be tested working with their real dependencies.
