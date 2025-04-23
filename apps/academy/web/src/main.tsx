import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import { router } from "./routes.tsx";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
} else {
  console.error("Root element not found");
}
