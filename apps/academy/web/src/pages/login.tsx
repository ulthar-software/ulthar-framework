import type { LoginInput } from "@ulthar/academy-domain";
import { LoginInputModel } from "@ulthar/academy-domain";
import { useNavigate } from "react-router";
import { UltharLogo } from "../components/academy/ulthar-logo.tsx";
import { Form } from "../components/forms/form.tsx";
import { FormButton, Input } from "../components/forms/index.ts";
import { Anchor } from "../components/ui/index.ts";
import { useAuthSetToken } from "../utils/auth/use-auth-set-token.ts";
import { useRPC } from "../utils/rpc/use-rpc.ts";

const loginSchema = LoginInputModel;

export default function Login() {
  const login = useRPC("login");
  const setToken = useAuthSetToken();
  const navigate = useNavigate();

  async function onLogin(data: LoginInput) {
    const result = await login(data);

    if (result.isOk()) {
      const { accessToken } = result.value;
      setToken(accessToken);
      void navigate("/");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <UltharLogo size="large" className="mb-8" />
      <Form schema={loginSchema} onSubmit={onLogin} className="w-full max-w-md">
        <Input name="email" type="email" label="Email" />
        <Input name="password" type="password" label="Contraseña" />
        <Anchor
          href="/forgot-password"
          className="text-primary text-center mt-6"
        >
          ¿Olvidaste tu contraseña?
        </Anchor>
        <FormButton color="primary">Ingresar</FormButton>
      </Form>
    </main>
  );
}
