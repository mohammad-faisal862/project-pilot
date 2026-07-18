import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export routes for Next App Router structure
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});