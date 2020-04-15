import { Resolver, Query, Arg, UseMiddleware, Ctx } from "type-graphql";
import { MyContext } from "../types/MyContext";
import { isUser } from "../middleware/isUser";

@Resolver()
export class GetUserResolver {
  @Query(() => Boolean)
  @UseMiddleware(isUser)
  async getUser(
    @Arg("value") value: number,
    @Ctx() ctx: MyContext
  ): Promise<Boolean | undefined> {
    console.log(value, ctx);
    return true;
  }
}
