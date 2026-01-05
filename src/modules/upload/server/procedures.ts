// src/server/api/routers/upload.ts
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { uploadRateLimit } from "@/lib/ratelimit";
import { TRPCError } from "@trpc/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure 
    .input(
      z.object({
        fileName: z.string(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fileName,videoId } = input;
      
      const userId = ctx.user.id

      const { success } = await uploadRateLimit.limit(userId);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Daily upload limit reached" });
      }

      const key = `videos/${videoId}_${userId}_${fileName}`; // unique key
      console.log(key);

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_UPLOAD_BUCKET!,
        Key: key,
        ContentType: "video/mp4",
        // ACL: "public-read",
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

      return {
        uploadUrl,
        key, // you can store this in DB to reference later
        fileUrl: `https://${process.env.AWS_S3_PROCESSED_VIDEOS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}/manifest.mpd`,
        thumbnailUrl: `https://${process.env.AWS_S3_PROCESSED_VIDEOS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}/poster.jpg`,
      };
    }),

    //TODO: thumbnail uploads -> similar architecture to videos thing
});
//https://boostervideos-processed-videos.s3.eu-west-3.amazonaws.com/videos/1759746511155_VIDEO%2520PAPA%2520CON%2520FONDO%2520QUITADO%2520SUBILO%2520YA.mp4/manifest.mpd
