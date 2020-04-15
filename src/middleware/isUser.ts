import { MiddlewareFn } from "type-graphql";

import { MyContext } from "../types/MyContext";

export const isUser: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (context.req.session!.role !== "user") {
    throw new Error("User is not permitted to perform this request.");
  }
  return next();
};
