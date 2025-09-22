import type { APIRoute } from "astro";
import JSZip from "jszip";
import { getDatabase } from "../../db/connection";
import { tracks, users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "auth-astro/server";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { getEnv } from "astro/env/runtime";

export const POST: APIRoute = async (ctx): Promise<Response> => {
  const _difficulty = ctx.request.headers.get("difficulty");
  const difficulty = _difficulty ? JSON.parse(_difficulty) : undefined;
  const meta = JSON.parse(ctx.request.headers.get("meta")!);
  const zipName = ctx.request.headers.get('zipName')!;
  // whether the chart is from Early Access or the beta
  const version = ctx.request.headers.get('version')!;

  // if uploading from the bot
  const botPassword = ctx.request.headers.get('botPassword');
  const userID = ctx.request.headers.get("userID");
  // For importing from the old database
  const discordID = ctx.request.headers.get("discordID")?? undefined;

  // if uploading from the website
  const session = await getSession(ctx);

  const fileData = await ctx.request.arrayBuffer();

  const createClient = () => {
    if (getEnv("S3_BUCKET") == "minio") {
      return new S3Client({
        endpoint: "http://localhost:9000",
        region: "us-east-1",
        credentials: {
          accessKeyId: getEnv("MINIO_KEY_ID")!,
          secretAccessKey: getEnv("MINIO_SECRET_KEY")!,
        },
        forcePathStyle: true // required for minio
      });
    } else if (getEnv("S3_BUCKET") == "backblaze") {
      return new S3Client({
        endpoint: "https://s3.us-east-005.backblazeb2.com/",
        region: "us-east-005",
        credentials: {
          accessKeyId: getEnv("B2_KEY_ID")!,
          secretAccessKey: getEnv("B2_APP_KEY")!
        },
        forcePathStyle: true
      });
    }
  }
  const db = await getDatabase(ctx);

  const Bucket = "charts-raging-kerosene-untie-unless-duvet-hundredth";
  let Key;
  let uploadedByBot = false;

  if (botPassword) {
    if (botPassword == getEnv("BOT_PASSWORD")) {
      if (userID && await db.query.users.findFirst({
        where: eq(users.id, userID),
      }).execute())
        uploadedByBot = true;
      Key = userID + "_" + zipName;
    } else if (!userID) {
      return new Response("", {
        status: 401,
        statusText: "Please include the header \"userID\" with your request"
      })
    } else {
      return new Response("", {
        status: 403,
        statusText: "User with id " + userID + " not found!"
      })
    }
  } else {
    if (!session?.user?.id) {
      return new Response("", {
        status: 401,
        statusText: "No User ID or Session found"
      })
    }
    Key = session.user.id + "_" + zipName;
  }

  if (!Key) {
    return new Response("", {
      status: 500,
      statusText: "Couldn't assign a Key to this file. This shouldn't ever be possible. ???",
    })
  }

  const client = createClient();

  if (!client) {
    return new Response("", {
      status: 500,
      statusText: "s3 Client could not be created",
    })
  }

  try {
    const command = new HeadObjectCommand({
      Bucket,
      Key
    });

    await client.send(command)
    // this shoud return error so user can update the file instead?
    return new Response("", {
      status: 500,
      statusText: "File Key already exists"
    })
  } catch {
    // catch
  }


  try {
    const command = new PutObjectCommand({
      Bucket,
      Key,
      Body: Buffer.from(fileData)
    });

    const res = await client.send(command);
    console.log("Success: ", res)
  } catch (err) {
    console.error("Error: ", err)
    return new Response("", {
      status: 403,
      statusText: "Upload Error: " + err
    })
  }


  const values = {

    title: meta.songName as string,
    author: meta.artist as string,
    description: meta.description as string,
    mapper: meta.charter as string,
    discordID: discordID,
    difficulty: difficulty ? JSON.stringify(difficulty) : undefined,
    // image upload will be a separated endpoint
    image: undefined,
    link: Key,
    version,
    uploader: userID ? userID as string : session?.user?.id as string,
    uploadedByBot: uploadedByBot ? "true" : "false",
  };
  console.log(values);

  await db
    .insert(tracks)
    .values(values)
    .returning()
    .execute();

  return new Response("", {
    status: 200,
  });
};
