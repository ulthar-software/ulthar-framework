import { Effect } from "@ulthar/immuty";

export namespace Crypto {
    export function generateUUID() {
        return Effect.fromSync(({ randomUUID }: { randomUUID: () => string }) =>
            randomUUID()
        );
    }
}
