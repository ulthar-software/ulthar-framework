/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { action } from "@storybook/addon-actions";
import type { ReactRenderer } from "@storybook/react";
import type { UserAccess } from "@ulthar/academy-domain";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import type { PartialStoryFn, StoryContext } from "storybook/internal/types";
import { AuthContext } from "../auth/auth-context.ts";
import { ModalProvider } from "../modal/modal-provider.tsx";
import type { ClientRPC } from "../rpc/rpc-context.ts";
import { EmptyRPCContext, RpcProvider } from "../rpc/rpc-context.ts";
import { MockErrorPage } from "./mock-error-page.tsx";

const navigationAction = action("navigation");
const setAccessTokenAction = action("setAccessToken");
const removeAccessTokenAction = action("removeAccessToken");

function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    navigationAction(location.pathname + location.search);
  }, [location]);

  return null;
}

export function Decorator(
  Story: PartialStoryFn<ReactRenderer, Record<string, any>>,
  { parameters }: StoryContext<ReactRenderer, Record<string, any>>,
) {
  const { pageLayout, rpcContext, user, route } = parameters;

  const currentPath =
    Object.entries(route?.params ?? {}).reduce((acc, [key, value]) => {
      return acc.replace(`:${key}`, value);
    }, route?.path ?? "") ?? "/";

  const currentQuery = new URLSearchParams(route?.query ?? {}).toString();

  const currentPathWithQuery = currentQuery
    ? `${currentPath}?${currentQuery}`
    : currentPath;

  switch (pageLayout) {
    case "full-providers":
      return (
        <MemoryRouter initialEntries={["/", currentPathWithQuery]}>
          <AuthContext.Provider
            value={{
              accessToken: user ? JSON.stringify(user) : undefined,
              user: user as UserAccess,
              removeAccessToken: removeAccessTokenAction,
              setAccessToken: setAccessTokenAction,
            }}
          >
            <RpcProvider
              value={{
                ...EmptyRPCContext,
                ...(rpcContext as Partial<ClientRPC>),
              }}
            >
              <ModalProvider>
                <NavigationTracker />
                <Routes>
                  {route && (
                    <Route path={route.path as string} element={<Story />} />
                  )}
                  <Route
                    path="/*"
                    element={
                      !route ? (
                        <Story />
                      ) : (
                        <MockErrorPage originalLocation={currentPath} />
                      )
                    }
                  />
                </Routes>
              </ModalProvider>
            </RpcProvider>
            <Toaster />
          </AuthContext.Provider>
        </MemoryRouter>
      );
    case "simple-routing":
      return (
        <MemoryRouter>
          <NavigationTracker />
          <Story />
          <Toaster />
        </MemoryRouter>
      );
    default:
      return <Story />;
  }
}
