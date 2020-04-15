import { buildSchema } from "type-graphql";

export default () => {
  return buildSchema({
    resolvers: [],
    // resolvers: [__dirname + "/../resolvers/**/*.resolver.ts"]
  });
};
