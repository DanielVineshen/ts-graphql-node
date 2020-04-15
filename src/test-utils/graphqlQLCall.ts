import { graphql, GraphQLSchema } from "graphql";
import buildGraphqlSchema from "../utils/buildGraphqlSchema";
import Maybe from "graphql/tsutils/Maybe";

interface Options {
  source: string;
  variableValues?: Maybe<{ [key: string]: any }>;
  isAuth?: boolean | null;
  userId?: number | null;
  administratorId?: number | null;
  role?: string | null;
}

let schema: GraphQLSchema;

export const graphQLCall = async ({
  source,
  variableValues,
  isAuth,
  userId,
  administratorId,
  role
}: Options) => {
  if (!schema) {
    schema = await buildGraphqlSchema();
  }
  return graphql({
    schema,
    source,
    variableValues,
    contextValue: {
      req: {
        session: {
          isAuth,
          userId,
          administratorId,
          role,
          destroy: jest.fn()
        }
      },
      res: {
        clearCookie: jest.fn()
      }
    }
  });
};
