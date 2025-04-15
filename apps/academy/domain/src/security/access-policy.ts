export const AccessPolicy = {
  ANONYMOUS: () => ({
    isAuthRequired: false,
    requiredPermissions: [],
  }),
} as const;
