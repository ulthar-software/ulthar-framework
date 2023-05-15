import { useState } from "react";
import { CountdownTimer } from "./countdown-timer.tsx";

export interface TimerProps {
    durationInMinutes: number;
    buttonText: string;
    timeoutMessage: string;
    prependText?: string;
}
export function Timer({
    durationInMinutes,
    buttonText,
    timeoutMessage,
    prependText,
}: TimerProps) {
    const [targetTimestamp, setTargetTimestamp] = useState<number | null>(null);

    if (!targetTimestamp) {
        return (
            <button
                style={{
                    fontSize: "18px",
                    padding: "5px",
                    borderRadius: "15px",
                    backgroundColor: "#E84545",
                    border: "none",
                }}
                onClick={() =>
                    setTargetTimestamp(
                        Date.now() + durationInMinutes * 1000 * 60
                    )
                }
            >
                {buttonText}
            </button>
        );
    }
    const date = new Date(targetTimestamp);
    const targetHour = date.getHours();
    const targetMinute = date.getMinutes();

    return (
        <CountdownTimer
            targetHour={targetHour}
            targetMinute={targetMinute}
            timeoutMessage={timeoutMessage}
            prependText={prependText}
        />
    );
}
