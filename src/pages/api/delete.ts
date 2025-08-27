import type { APIRoute } from "astro";

export const DELETE: APIRoute =  async (ctx): Promise<Response> => {

  // TODO!() add delete function here
  return new Response("deleted", {
    status: 200,
  })
}
