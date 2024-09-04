export type PolicyMap<
  UserType extends string,
  PolicyType extends string,
> = Record<UserType, PolicyType[]>;
