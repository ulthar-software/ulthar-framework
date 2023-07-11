import { TimeSpan } from "./time-span.js";

class TimeSingleton {
    private _sync: boolean = true;
    private _now: number = Date.now();

    get isSynced(): boolean {
        return this._sync;
    }

    now(): number {
        if (this.isSynced) return Date.now();
        return this._now;
    }

    forward(span: TimeSpan): void {
        this._now += span.toMilliseconds();
    }

    setSync(sync: boolean): void {
        this._sync = sync;
        this._now = Date.now();
    }

    sleep(span: TimeSpan): Promise<void> {
        return new Promise((resolve) => {
            if (this.isSynced) {
                setTimeout(resolve, span.toMilliseconds());
                return;
            }
            this.forward(span);
            resolve();
        });
    }
}

export const Time = new TimeSingleton();
