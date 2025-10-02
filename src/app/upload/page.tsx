// components/UploadButton.tsx
"use client";
import { useState } from "react";

const Page = () => {
  return (
    <UploadButton />
  )
}
export default Page

function UploadButton({ onUploaded }: { onUploaded?: (guid: string) => void }) {
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);

    //1 - Create video object like in docs
    const meta = await fetch("/api/bunny/create", {
      method: "POST",
      body: JSON.stringify({ title: file.name }),
    }).then((r) => r.json());


    const videoId = meta.guid as string;
    
    console.log(videoId)
    // 2 -  upload video by updating the video  object previously obtained
    const r = await fetch(`/api/bunny/upload?videoId=${videoId}`, { method: "PUT", body: file });
    if (!r.ok) console.log(await r.text());
    onUploaded?.(videoId);
    setBusy(false);
  }

    return (
        <>
            <input type="file" accept="video/*" disabled={busy} onChange={onPick} />;
            {/* <BunnyEmbed libraryId={process.env.BUNNY_STREAM_LIBRARY_ID!} videoId={video_id} /> */}
        </>
  )
}
