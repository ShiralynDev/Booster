import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

//to use the get one as type in the components
export type VideoGetOneOutput = inferRouterOutputs<AppRouter>["videos"]["getOne"];
export type CommentOutput = inferRouterOutputs<AppRouter>["comments"]["getTopLevel"]["comments"];
export type VideoGetManyOutput = inferRouterOutputs<AppRouter>["home"]["getMany"];