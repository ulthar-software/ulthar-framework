export interface Logger {
  error(message: unknown): void;
  info(message: unknown): void;
  warn(message: unknown): void;
  debug(message: unknown): void;
}
