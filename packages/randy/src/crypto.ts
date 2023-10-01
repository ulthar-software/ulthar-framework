import { Effect } from "@ulthar/effecty";

export namespace Crypto {
    export function generateUUID() {
        return Effect.fromSync(({ randomUUID }: { randomUUID: () => string }) =>
            randomUUID()
        );
    }
}
