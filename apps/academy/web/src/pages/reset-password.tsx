import type { Infer } from "@fabric/core";
import { Field, Schema } from "@fabric/core";
import { useNavigate } from "react-router";
import { PageContainer } from "../components/academy/page-container.tsx";
import { PageContent } from "../components/academy/page-content.tsx";
import { PlatformFooter } from "../components/academy/platform-footer.tsx";
import { UltharLogo } from "../components/academy/ulthar-logo.tsx";
import { Form } from "../components/forms/form.tsx";
import { FormButton, Input } from "../components/forms/index.ts";
import { Anchor, LoadingSpinner } from "../components/ui/index.ts";
import { createParsedSearchParams } from "../utils/routing/use-search-params.ts";
import { useRPC } from "../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../utils/toasts/show-error-toast.ts";
import { showSuccessToast } from "../utils/toasts/show-success-toast.ts";

const ResetPasswordSchema = new Schema({
  password: Field.string(),
  confirmPassword: Field.string(),
});
type ResetPasswordFormValues = Infer<typeof ResetPasswordSchema>;

const searchSchema = new Schema({
  token: Field.string(),
  email: Field.email(),
});

const useSearchParams = createParsedSearchParams(searchSchema, {
  navigateTo: "/forgot-password",
  message:
    "Enlace inválido. Por favor, solicita un nuevo enlace de restablecimiento.",
});

export default function ResetPassword() {
  const resetPassword = useRPC("resetPassword");
  const navigate = useNavigate();
  const [isLoading, { token, email }] = useSearchParams();

  async function onResetPassword(data: ResetPasswordFormValues) {
    if (data.password !== data.confirmPassword) {
      showErrorToast(
        "Las contraseñas no coinciden. Por favor, intentá nuevamente.",
      );
      return;
    }

    const result = await resetPassword({
      newPassword: data.password,
      token,
      email,
    });

    if (result.isOk()) {
      showSuccessToast("Tu contraseña ha sido restablecida exitosamente.");
      void navigate("/login");
    }

    if (result.isError()) {
      showErrorToast(
        "No pudimos restablecer tu contraseña. \nPor favor, solicita un nuevo enlace de restablecimiento.",
      );
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageContent className="flex flex-col justify-center items-center">
          <UltharLogo size="large" className="mb-8" />
          <p className="text-gray-300 text-sm">
            Estamos verificando tu enlace de restablecimiento...
          </p>
          <LoadingSpinner className="mt-4" />
        </PageContent>
        <PlatformFooter />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageContent className="flex flex-col justify-center items-center">
        <UltharLogo size="large" className="mb-8" />
        <section className="w-full max-w-lg flex flex-col justify-center sm:bg-dark-alt rounded-lg shadow-md grow sm:grow-0 sm:p-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Restablecer contraseña
            </h1>
            <p className="text-gray-300 text-sm">
              Ingresá tu nueva contraseña para {email}
            </p>
          </div>
          <Form
            schema={ResetPasswordSchema}
            onSubmit={onResetPassword}
            className="w-full"
          >
            <Input name="password" type="password" label="Nueva contraseña" />
            <Input
              name="confirmPassword"
              type="password"
              label="Confirmar contraseña"
            />
            <FormButton className="bg-primary">
              Restablecer contraseña
            </FormButton>
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
