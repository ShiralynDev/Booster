import { db } from "../db";
import { videos } from "../db/schema";
import { getBunnyVideo } from "../lib/bunny";
import { eq, isNull, or } from "drizzle-orm";

async function main() {
  console.log("Starting backfill of video dimensions...");

  // Fetch videos where width OR height is null
  const videosToUpdate = await db
    .select()
    .from(videos)
    .where(or(isNull(videos.width), isNull(videos.height)));

  console.log(`Found ${videosToUpdate.length} videos to update.`);

  for (const video of videosToUpdate) {
    if (!video.bunnyLibraryId || !video.bunnyVideoId) {
      console.log(`Skipping video ${video.id} (no bunny info)`);
      continue;
    }

    try {
      console.log(`Fetching info for video ${video.id}...`);
      const info = await getBunnyVideo(video.bunnyLibraryId, video.bunnyVideoId);
      
      if (info.width && info.height) {
        await db
          .update(videos)
          .set({
            width: info.width,
            height: info.height,
          })
          .where(eq(videos.id, video.id));
        console.log(`Updated video ${video.id}: ${info.width}x${info.height}`);
      } else {
        console.log(`No dimensions found for video ${video.id}`);
      }
    } catch (error) {
      console.error(`Failed to update video ${video.id}:`, error);
    }
  }

  console.log("Backfill complete.");
}

main();
