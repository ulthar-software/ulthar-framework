import { SlideCodeElement } from "@ulthar/sliddy-core";
import { useEffect, useState } from "react";
import Prism from "prismjs";
// import "prismjs/themes/prism.css";
import "../../src/prism-vsc-dark.css";

export interface CodeElementProps {
    element: SlideCodeElement;
}

export function CodeElement({ element }: CodeElementProps) {
    const [code, setCode] = useState(element.properties.code);
    useEffect(() => {
        if (element.properties.code !== code) setCode(element.properties.code);
        if (!element.properties.code) {
            (async () => {
                const res = await fetch(element.properties.file!);
                const code = await res.text();
                setCode(code);
            })();
        }
    }, [element.properties.code]);

    useEffect(() => {
        if (code) {
            Prism.highlightAll();
        }
    }, [code]);

    return (
        <pre
            style={{
                height: "100%",
                ...(element.styles as any),
            }}
        >
            <code
                className={"language-" + element.properties.language}
                style={{ fontSize: "24px" }}
            >
                {code}
            </code>
        </pre>
    );
}
