import { useEffect, useState } from "react";

export interface CountDownTimerProps {
    targetHour: number;
    targetMinute: number;
    prependText?: string;
    timeoutMessage: string;
}

function formatTime(time: number) {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time - hours * 3600000) / 60000);
    const seconds = Math.floor(
        (time - hours * 3600000 - minutes * 60000) / 1000
    );

    return (
        [hours, minutes, seconds]
            // .filter((value) => value !== null)
            .map((value) => value.toString().padStart(2, "0"))
            .join(":")
    );
}

export function CountdownTimer({
    targetHour,
    targetMinute,
    timeoutMessage,
    prependText,
}: CountDownTimerProps) {
    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            const target = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                targetHour,
                targetMinute,
                0
            );
            let diff: number = target.valueOf() - now.valueOf();

            if (diff < 0) {
                clearInterval(intervalId);
                setRemainingTime(0);
            } else {
                setRemainingTime(diff);
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [targetHour, targetMinute]);

    if (remainingTime === 0) return <div>{timeoutMessage}</div>;

    return (
        <div>
            {(prependText ? prependText : "") + " " + formatTime(remainingTime)}
        </div>
    );
}
