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
        if (!element.properties.code) {
            (async () => {
                const res = await fetch(element.properties.file!);
                const code = await res.text();
                setCode(code);
            })();
            return;
        }
        if (element.properties.code !== code) setCode(element.properties.code);
    }, [element.properties.code, element.properties.file]);

    useEffect(() => {
        if (code) {
            Prism.highlightAll();
        }
    }, [code]);

    const lineNumbers = element.properties.lineNumbers ?? true;
    const prismClasses: string[] = [];
    if (lineNumbers) prismClasses.push("line-numbers");

    return (
        <pre
            className={prismClasses.join(" ")}
            style={{
                height: "100%",
                maxWidth: "100%",
                fontSize: "24px",
                ...(element.styles as any),
            }}
        >
            <code
                className={"language-" + element.properties.language}
                style={{ fontSize: "inherit" }}
            >
                {code}
            </code>
        </pre>
    );
}
