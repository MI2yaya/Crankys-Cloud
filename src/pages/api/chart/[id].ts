import type { APIRoute } from "astro";
import { S3Client, PutObjectCommand, ListObjectsCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSession } from "auth-astro/server";
import { getEnv } from "astro/env/runtime";
import { getDatabase } from "../../../db/connection";
import { eq } from "drizzle-orm";
import { tracks } from "../../../db/schema";

export const GET: APIRoute = async (ctx): Promise<Response> => { 
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

  const db = await getDatabase(ctx);
  const chartInfo = await db.query.tracks.findFirst({ where: eq(tracks.id, ctx.params.id!)}).execute();
  const Key = chartInfo?.link!;
    
  try {
    const res = await client.send(new GetObjectCommand({
      Bucket,
      Key,
    }));
    const buf = Buffer.from(await res.Body?.transformToByteArray()!)
    const headers = new Headers();
    headers.append("Content-Disposition", "attachment; filename=" + chartInfo?.title + ".zip");

    return new Response(buf, {
      status: 200,
      headers,
    })
  } catch (err) {
    return new Response("", {
      status: 404,
      statusText: err as string | undefined,
    })
  }
}
