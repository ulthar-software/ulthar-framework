import React from "react";
import ReactDOM from "react-dom/client";
import { DeckComponent } from "../lib/deck.tsx";
import "./index.css";
import deck from "./example-deck.ts";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <DeckComponent deck={deck} />
    </React.StrictMode>
);
