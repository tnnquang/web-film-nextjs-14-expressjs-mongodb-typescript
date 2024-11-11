import React from "react";

export default function IframePlayerComponent({ videoLink }: { videoLink: string }) {
  if (!videoLink) return null;
  return (
    <div className="normal-player-iframe w-full !overflow-hidden rounded-md">
      <iframe
        width="100%"
        height="100%"
        src={videoLink}
        title="video"
        allowFullScreen
        className="rounded-md aspect-video"
      />
    </div>
  );
}
