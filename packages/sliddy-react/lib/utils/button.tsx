import { PropsWithChildren } from "react";
import styled from "styled-components";

interface ButtonProps {
    type: "accent" | "clear";
}

export const Button = styled.button<PropsWithChildren<ButtonProps>>(
    ({ type, theme }) => {
        return {
            fontSize: "2em",
            padding: "1em",
            borderRadius: "1em",
            backgroundColor:
                type === "accent" ? theme.accentColor : "transparent",
            color: "#000",
        };
    }
);
