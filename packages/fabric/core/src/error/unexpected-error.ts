import { TaggedError } from "./tagged-error.js";

/**
 * `UnexpectedError` representa cualquier tipo de error inesperado.
 *
 * Este error se utiliza para representar errores que no deberían ocurrir en
 * la lógica de la aplicación, pero que siempre podrían suceder y
 * debemos estar preparados para manejarlos.
 */
export class UnexpectedError extends TaggedError<"UnexpectedError"> {
  constructor() {
    super("UnexpectedError");
  }
}
