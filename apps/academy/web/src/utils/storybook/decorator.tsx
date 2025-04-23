/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { action } from "@storybook/addon-actions";
import type { ReactRenderer } from "@storybook/react";
import type { UserAccess } from "@ulthar/academy-domain";
import { useEffect } from "react";
import { MemoryRouter, useLocation } from "react-router";
import type { PartialStoryFn, StoryContext } from "storybook/internal/types";
import { AuthContext } from "../auth/auth-context.ts";
import type { ClientRPC } from "../rpc/rpc-context.ts";
import { EmptyRPCContext, RpcProvider } from "../rpc/rpc-context.ts";

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
  const { pageLayout, rpcContext, user } = parameters;

  switch (pageLayout) {
    case "page":
      return (
        <MemoryRouter>
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
              <NavigationTracker />
              <Story />
            </RpcProvider>
          </AuthContext.Provider>
        </MemoryRouter>
      );
    case "simple-routing":
      return (
        <MemoryRouter>
          <NavigationTracker />
          <Story />
        </MemoryRouter>
      );
    default:
      return <Story />;
  }
}
