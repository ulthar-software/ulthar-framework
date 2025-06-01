import type { Infer } from "@fabric/core";
import { exhaustiveCheck, Field, Schema } from "@fabric/core";
import { useNavigate } from "react-router";
import { PageContainer } from "../components/academy/page-container.tsx";
import { PageContent } from "../components/academy/page-content.tsx";
import { PlatformFooter } from "../components/academy/platform-footer.tsx";
import { UltharLogo } from "../components/academy/ulthar-logo.tsx";
import { Form } from "../components/forms/form.tsx";
import { FormButton, Input } from "../components/forms/index.ts";
import { LoadingSpinner } from "../components/ui/loading-spinner.tsx";
import { createParsedSearchParams } from "../utils/routing/use-search-params.ts";
import { useRPC } from "../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../utils/toasts/show-error-toast.ts";
import { showSuccessToast } from "../utils/toasts/show-success-toast.ts";

const registerSchema = new Schema({
  firstName: Field.string(),
  lastName: Field.string(),
  password: Field.string(),
  confirmPassword: Field.string(),
});
type FormValues = Infer<typeof registerSchema>;

const querySchema = new Schema({
  email: Field.email(),
  code: Field.string(),
});

const useParsedSearchParams = createParsedSearchParams(querySchema);

export default function Register() {
  const register = useRPC("registerUser");
  const [isLoading, { email, code }, error] = useParsedSearchParams();
  const navigate = useNavigate();

  async function onRegister(data: FormValues) {
    if (data.password !== data.confirmPassword) {
      showErrorToast(
        "Las contraseñas no coinciden. Por favor, intentá nuevamente.",
      );
      return;
    }

    const result = await register({
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      email,
      inviteCode: code,
    });

    if (result.isOk()) {
      showSuccessToast("Te registraste con éxito! Ya podés iniciar sesión.");
      void navigate("/login");
    } else {
      const error = result.unwrapErrorOrThrow();
      switch (error._tag) {
        case "InvalidInviteCodeError":
          showErrorToast(
            "El código de invitación es inválido o ha expirado. Por favor, revisá tu email por un nuevo código o contactános para obtener un nuevo código.",
          );
          break;
        case "UnexpectedError":
          showErrorToast(
            "Ocurrió un error inesperado. Prueba nuevamente más adelante. Si el problema persiste, por favor, contactá a soporte.",
          );
          break;
        default:
          exhaustiveCheck(error);
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <PageContainer>
        <PageContent className="flex flex-col justify-center items-center">
          <UltharLogo size="large" className="mb-8" />
          <section className="w-full max-w-lg flex flex-col justify-center sm:bg-dark-alt rounded-lg shadow-md grow sm:grow-0 sm:p-4">
            <p className="text-red-500 text-center">
              El código de invitación y/o el email son inválidos, o no se han
              proporcionado.
            </p>
            <p className="text-gray-500 text-center mt-2">
              Accedé a la plataforma desde{" "}
              <span className="font-bold text-primary">
                el enlace que te enviamos por email
              </span>{" "}
              o contactá a soporte para obtener ayuda.
            </p>
          </section>
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
          <Form
            schema={registerSchema}
            onSubmit={onRegister}
            className="w-full"
          >
            <Input name="firstName" type="text" label="Nombre" />
            <Input name="lastName" type="text" label="Apellido" />
            <Input name="password" type="password" label="Contraseña" />
            <Input
              name="confirmPassword"
              type="password"
              label="Confirmar Contraseña"
            />
            <FormButton className="bg-primary">Registrar</FormButton>
          </Form>
        </section>
      </PageContent>
      <PlatformFooter />
    </PageContainer>
  );
}
