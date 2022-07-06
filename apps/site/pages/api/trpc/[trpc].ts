import { appRouter, createContext } from "@self-learning/api";
import * as trpcNext from "@trpc/server/adapters/next";
// export type definition of API

// export API handler
export default trpcNext.createNextApiHandler({
	router: appRouter,
	createContext: createContext
});
