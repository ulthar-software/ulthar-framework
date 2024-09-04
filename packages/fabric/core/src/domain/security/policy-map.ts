/**
 * A PolicyMap maps user types to their security policies.
 */
export type PolicyMap<
  UserType extends string,
  PolicyType extends string,
> = Record<UserType, PolicyType[]>;
