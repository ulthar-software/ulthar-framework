import {
  RequestPasswordResetInputModel,
  type RequestPasswordResetInput,
} from "@ulthar/academy-domain";
import { useNavigate } from "react-router";
import { PageContainer } from "../components/academy/page-container.tsx";
import { PageContent } from "../components/academy/page-content.tsx";
import { PlatformFooter } from "../components/academy/platform-footer.tsx";
import { UltharLogo } from "../components/academy/ulthar-logo.tsx";
import { Form } from "../components/forms/form.tsx";
import { FormButton, Input } from "../components/forms/index.ts";
import { Anchor } from "../components/ui/index.ts";
import { useRPC } from "../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../utils/toasts/show-error-toast.ts";
import { showSuccessToast } from "../utils/toasts/show-success-toast.ts";

const forgotPasswordSchema = RequestPasswordResetInputModel;

export default function ForgotPassword() {
  const requestPasswordReset = useRPC("requestPasswordReset");
  const navigate = useNavigate();

  async function onForgotPassword(data: RequestPasswordResetInput) {
    const result = await requestPasswordReset(data);

    if (result.isOk()) {
      showSuccessToast(
        "Te enviamos un email con las instrucciones para restablecer tu contraseña.",
      );
      void navigate("/login");
    }

    if (result.isError()) {
      showErrorToast(
        "No pudimos procesar tu solicitud. \nPor favor, volvé a intentarlo más tarde.",
      );
    }
  }

  return (
    <PageContainer>
      <PageContent className="flex flex-col justify-center items-center">
        <UltharLogo size="large" className="mb-8" />
        <section className="w-full max-w-lg flex flex-col justify-center sm:bg-dark-alt rounded-lg shadow-md grow sm:grow-0 sm:p-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-gray-300 text-sm">
              Ingresá tu email y te enviaremos las instrucciones para
              restablecerla.
            </p>
          </div>
          <Form
            schema={forgotPasswordSchema}
            onSubmit={onForgotPassword}
            className="w-full"
          >
            <Input name="email" type="email" label="Email" />
            <FormButton className="bg-primary">Enviar instrucciones</FormButton>
            <Anchor href="/login" className="text-primary text-center mt-4">
              Volver al inicio de sesión
            </Anchor>
          </Form>
        </section>
      </PageContent>
      <PlatformFooter />
    </PageContainer>
  );
}
