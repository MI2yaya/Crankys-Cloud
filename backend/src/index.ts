import { fromHono } from "chanfana";
import { Hono } from "hono";
import { Test } from "./endpoints/test";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/test", Test);


// Export the Hono app
export default app;
