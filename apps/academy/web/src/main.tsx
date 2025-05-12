import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router";
import "./index.css";
import { router } from "./routes.tsx";
import { AuthProvider } from "./utils/auth/auth-provider.tsx";
import { ModalProvider } from "./utils/modal/modal-provider.tsx";
import { ConcreteRpcProvider } from "./utils/rpc/rpc-provider.tsx";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProvider>
        <ConcreteRpcProvider>
          <ModalProvider>
            <RouterProvider router={router} />
          </ModalProvider>
          <Toaster />
        </ConcreteRpcProvider>
      </AuthProvider>
    </StrictMode>,
  );
} else {
  console.error("Root element not found");
}
