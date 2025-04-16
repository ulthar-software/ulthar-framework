import type { CryptoService } from "@fabric/core";

export interface DomainCryptoService extends CryptoService {
  generateInviteCode(): string;
}
