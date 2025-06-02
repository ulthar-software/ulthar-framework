/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { createContext } from "react";

import { Result, UnexpectedError } from "@fabric/core";
import type {
  DomainUseCases,
  UseCaseInput,
  UseCaseName,
  UseCaseOutput,
} from "@ulthar/academy-domain";

export type UseCaseNames = UseCaseName<DomainUseCases[number]>;

export type UseCaseFromName<TName extends UseCaseNames> = {
  [T in DomainUseCases[number] as T["name"]]: T;
}[TName];

export type UseCaseRPC<TName extends UseCaseNames> = (
  input: UseCaseInput<UseCaseFromName<TName>>,
) => UseCaseOutput<UseCaseFromName<TName>>;

export type RpcClient = {
  [TName in UseCaseNames]: UseCaseRPC<TName>;
};

function emptyMock<T extends Function>(): T {
  return (() =>
    Promise.resolve(
      Result.failWith(new UnexpectedError("RPC method not found")),
    )) as unknown as T;
}

export const EmptyRPCContext: RpcClient = {
  addModuleToCourse: emptyMock<UseCaseRPC<"addModuleToCourse">>(),
  addUnitToModule: emptyMock<UseCaseRPC<"addUnitToModule">>(),
  changeCourseDescription: emptyMock<UseCaseRPC<"changeCourseDescription">>(),
  changeCourseTitle: emptyMock<UseCaseRPC<"changeCourseTitle">>(),
  createCourse: emptyMock<UseCaseRPC<"createCourse">>(),
  enrollStudentInCourse: emptyMock<UseCaseRPC<"enrollStudentInCourse">>(),
  inviteUser: emptyMock<UseCaseRPC<"inviteUser">>(),
  login: emptyMock<UseCaseRPC<"login">>(),
  changeModuleOrder: emptyMock<UseCaseRPC<"changeModuleOrder">>(),
  getAllCourses: emptyMock<UseCaseRPC<"getAllCourses">>(),
  getCourseDetails: emptyMock<UseCaseRPC<"getCourseDetails">>(),
  getUnitWithSections: emptyMock<UseCaseRPC<"getUnitWithSections">>(),
  createTag: emptyMock<UseCaseRPC<"createTag">>(),
  getResourcesByUnitTags: emptyMock<UseCaseRPC<"getResourcesByUnitTags">>(),
  addQuestionnaireResponse: emptyMock<UseCaseRPC<"addQuestionnaireResponse">>(),
  getQuestionnaireResponse: emptyMock<UseCaseRPC<"getQuestionnaireResponse">>(),
  enrollUsersByEmail: emptyMock<UseCaseRPC<"enrollUsersByEmail">>(),
  addTextSectionToUnit: emptyMock<UseCaseRPC<"addTextSectionToUnit">>(),
  addVideoSectionToUnit: emptyMock<UseCaseRPC<"addVideoSectionToUnit">>(),
  addQuestionnaireSectionToUnit:
    emptyMock<UseCaseRPC<"addQuestionnaireSectionToUnit">>(),
  registerUser: emptyMock<UseCaseRPC<"registerUser">>(),
  changeModuleTitle: emptyMock<UseCaseRPC<"changeModuleTitle">>(),
  changeUnitTitle: emptyMock<UseCaseRPC<"changeUnitTitle">>(),
  editQuestionnaireSectionContent:
    emptyMock<UseCaseRPC<"editQuestionnaireSectionContent">>(),
  editTextSectionContent: emptyMock<UseCaseRPC<"editTextSectionContent">>(),
  editVideoSectionContent: emptyMock<UseCaseRPC<"editVideoSectionContent">>(),
  getCourseEnrollments: emptyMock<UseCaseRPC<"getCourseEnrollments">>(),
  getCurrentUser: emptyMock<UseCaseRPC<"getCurrentUser">>(),
  getTags: emptyMock<UseCaseRPC<"getTags">>(),
  listUserInvites: emptyMock<UseCaseRPC<"listUserInvites">>(),
  listUsers: emptyMock<UseCaseRPC<"listUsers">>(),
  addResourceToCourse: emptyMock<UseCaseRPC<"addResourceToCourse">>(),
  addTagToResource: emptyMock<UseCaseRPC<"addTagToResource">>(),
  addTagToUnit: emptyMock<UseCaseRPC<"addTagToUnit">>(),
  editResource: emptyMock<UseCaseRPC<"editResource">>(),
  requestPasswordReset: emptyMock<UseCaseRPC<"requestPasswordReset">>(),
  resetPassword: emptyMock<UseCaseRPC<"resetPassword">>(),
  resendInvite: emptyMock<UseCaseRPC<"resendInvite">>(),
};

export const RpcContext = createContext<RpcClient>(EmptyRPCContext);
export const RpcProvider = RpcContext.Provider;
