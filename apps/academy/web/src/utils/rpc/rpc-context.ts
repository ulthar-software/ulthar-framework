/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { createContext } from "react";

import type {
  UseCaseInput,
  UseCaseName,
  UseCaseOutput,
  UseCases,
} from "@ulthar/academy-domain";

export type UseCaseNames = UseCaseName<UseCases[number]>;

export type UseCaseFromName<TName extends UseCaseNames> = {
  [T in UseCases[number] as T["name"]]: T;
}[TName];

export type UseCaseRPC<TName extends UseCaseNames> = (
  input: UseCaseInput<UseCaseFromName<TName>>,
) => UseCaseOutput<UseCaseFromName<TName>>;

export type ClientRPC = {
  [TName in UseCaseNames]: UseCaseRPC<TName>;
};

function emptyMock<T extends Function>(): T {
  return (() => void 0) as unknown as T;
}

export const EmptyRPCContext: ClientRPC = {
  addModuleToCourse: emptyMock<UseCaseRPC<"addModuleToCourse">>(),
  addUnitToModule: emptyMock<UseCaseRPC<"addUnitToModule">>(),
  changeCourseDescription: emptyMock<UseCaseRPC<"changeCourseDescription">>(),
  changeCourseTitle: emptyMock<UseCaseRPC<"changeCourseTitle">>(),
  createCourse: emptyMock<UseCaseRPC<"createCourse">>(),
  enrollStudentInCourse: emptyMock<UseCaseRPC<"enrollStudentInCourse">>(),
  inviteUser: emptyMock<UseCaseRPC<"inviteUser">>(),
  login: emptyMock<UseCaseRPC<"login">>(),
  changeModuleOrder: emptyMock<UseCaseRPC<"changeModuleOrder">>(),
};

export const RpcContext = createContext<ClientRPC>(EmptyRPCContext);
export const RpcProvider = RpcContext.Provider;
