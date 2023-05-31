import { ReactNode } from "react";
import styled from "styled-components";

type Matcher = {
    tag: string;
    regexp?: string;
    component: (props: { children: ReactNode }) => JSX.Element;
};

export const Strong = styled.strong(({ theme }) => ({
    color: theme.accentColor,
}));
export const Emph = styled.em(({ theme }) => ({
    color: theme.accentColor,
}));

const matchers: Matcher[] = [
    {
        tag: "**",
        regexp: "\\*\\*",
        component: ({ children }) => <Strong>{children}</Strong>,
    },
    {
        tag: "__",
        component: ({ children }) => <Emph>{children}</Emph>,
    },
    {
        tag: "~~",
        component: ({ children }) => (
            <span
                style={{
                    textDecoration: "line-through",
                }}
            >
                {children}
            </span>
        ),
    },
];

export function parseStringMarkdown(text: string): ReactNode[] | ReactNode {
    if (!text) return null;

    const regexp = matchers.map((t) => t.regexp ?? t.tag).join("|");
    const regex = new RegExp(`(${regexp})`, "g");
    const parts = text.split(regex);

    const result = parts
        .map((part, i) => {
            const match = matchers.find((t) => t.tag == part);

            if (match) {
                let innerText = "";
                let j = i + 1;
                for (; j < parts.length; j++) {
                    if (parts[j] === match.tag) {
                        break;
                    }
                    innerText += parts[j];
                }
                parts.splice(i, j - i);
                return match.component({
                    children: parseStringMarkdown(innerText),
                });
            }

            return part;
        })
        .filter((part) => part);

    if (result.length === 1) {
        return result[0];
    }
    return result;
}
