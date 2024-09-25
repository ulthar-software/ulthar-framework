/**
 * A Policy maps permissions to which user types are allowed to perform them.
 */
export type Policy<
  TUserType extends string,
  TPolicyType extends string,
> = Record<TPolicyType, TUserType[]>;
