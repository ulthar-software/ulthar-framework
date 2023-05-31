import { Excalidraw, THEME, loadFromBlob } from "@excalidraw/excalidraw";
import { Heading } from "../utils/heading.tsx";
import { parseStringMarkdown } from "../utils/parse-markdown.tsx";
import { FlexContainer } from "../utils/flex-container.tsx";
import { useEffect, useState } from "react";

interface BlackboardProps {
    title?: string;
    file?: string;
}

export function Blackboard({ title, file }: BlackboardProps) {
    const [scene, setScene] = useState<any>(null);

    useEffect(() => {
        (async () => {
            try {
                if (!file) return;
                const response = await fetch(file);
                const blob = await response.blob();
                const scene = await loadFromBlob(blob, null, null);
                setScene(scene);
            } catch (err) {
                console.error(err);
            }
        })();
    }, [file]);

    if (file && !scene) return <div>Loading...</div>;

    return (
        <FlexContainer
            style={{ flexDirection: "column", height: "calc(100% - 50px)" }}
        >
            {title && (
                <Heading style={{ fontSize: "0.8em" }}>
                    {parseStringMarkdown(title)}
                </Heading>
            )}
            <div style={{ flexGrow: 1 }}>
                <Excalidraw
                    UIOptions={{
                        canvasActions: {
                            loadScene: false,
                            export: {
                                saveFileToDisk: true,
                            },
                            clearCanvas: false,
                            saveToActiveFile: true,
                            toggleTheme: false,
                            changeViewBackgroundColor: false,
                        },
                    }}
                    initialData={{
                        ...scene,
                        appState: {
                            zenModeEnabled: !!file,
                            theme: THEME.DARK,
                            viewModeEnabled: !!file,
                        },
                        scrollToContent: true,
                    }}
                />
            </div>
        </FlexContainer>
    );
}
