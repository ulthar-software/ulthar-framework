import { Effect } from "@ulthar/effecty";

export namespace Crypto {
    export function generateUUID() {
        return Effect.from(({ randomUUID }: { randomUUID: () => string }) =>
            randomUUID()
        );
    }
}
