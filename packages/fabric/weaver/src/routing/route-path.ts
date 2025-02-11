//Create a type that represents a valid route path
export type RoutePath = `/${string}`;
//Create a regular expression that matches a valid route path
export const RoutePath = /${[^/]+}/;

export type RoutesDefinition = Record<string, RoutePath>;
