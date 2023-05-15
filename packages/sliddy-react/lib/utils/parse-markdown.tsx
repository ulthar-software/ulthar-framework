import { ReactNode } from "react";
import styled from "styled-components";

type Matcher = {
    tag: string;
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
        component: ({ children }) => <Strong>{children}</Strong>,
    },
    {
        tag: "__",
        component: ({ children }) => <Emph>{children}</Emph>,
    },
];

export function parseStringMarkdown(text: string): ReactNode[] | ReactNode {
    if (!text) return null;

    const regex = new RegExp(`(\\*\\*|__)`);
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
