import type { APIRoute } from "astro";
import JSZip from "jszip";
import { getDatabase } from "../../db/connection";
import { tracks, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "auth-astro/server";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { getEnv } from "astro/env/runtime";

export const POST: APIRoute = async (ctx): Promise<Response> => {
  const session = await getSession(ctx);
  const _difficulty = ctx.request.headers.get("difficulty");
  const difficulty = _difficulty ? JSON.parse(_difficulty) : undefined;
  const meta = JSON.parse(ctx.request.headers.get("meta")!);
  const zipName = ctx.request.headers.get('zipName')!;

  const fileData = await ctx.request.arrayBuffer();

  if (!session?.user?.id) {
    return new Response("No User ID", {
      status: 400
    })
  }

  const Key = session.user.id! + "_" + zipName + ".zip";
  const client = new S3Client({
    endpoint: "http://localhost:9000",
    region: "us-east-1",
    credentials: {
      accessKeyId: getEnv("MINIO_KEY_ID")!,
      secretAccessKey: getEnv("MINIO_SECRET_KEY")!,
    },
    forcePathStyle: true // required for minio
  });
  const Bucket = "charts";

  try {
    await client.send(new HeadObjectCommand({
      Bucket,
      Key 
    }))
    // this shoud return error so user can update the file instead?
    return new Response("", {
      status: 500,
      statusText: "File Key already exists"
    })
  } catch {
    // catch
  }

  const command = new PutObjectCommand({
    Bucket,
    Key,
    Body: Buffer.from(fileData)
  });

  try {
    const res = await client.send(command);
    console.log("Success: ", res)
  } catch(err) {
    console.error("Error: ", err)
  }


  const db = await getDatabase(ctx);
  await db
    .insert(tracks)
    .values({
      title: meta.songName as string,
      author: meta.artist as string,
      description: meta.description as string,
      mapper: session?.user?.id,
      difficulty: difficulty ? JSON.stringify(difficulty) : undefined,
      // image upload will be a separated endpoint
      image: undefined,
      link: Key,
    })
    .returning()
    .execute();

    return new Response("", {
        status: 200,
    });
};
