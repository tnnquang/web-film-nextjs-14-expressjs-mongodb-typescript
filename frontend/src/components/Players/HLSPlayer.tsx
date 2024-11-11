import { TheosPlayer } from "@aka_theos/react-hls-player";
// import ReactPlayer from "react-player/lazy";

export default function HLSPlayerComponent({
  videoLink,
}: {
  videoLink: string;
}) {
  if (!videoLink) return null;
  return (
    <div className="relative w-full overflow-hidden rounded-md">
      <TheosPlayer
        src={videoLink}
        width="100%"
        style={{ aspectRatio: "16/9", overflow: "hidden" }}
        height="100%"
        autoPlay
      />
      {/* <ReactPlayer
      pip
      url={videoLink}
      height={400}
      width="100%"
      playsinline
      controls
      style={{
        objectFit: "cover"
      }}
      /> */}
    </div>
  );
}
