import React, { useEffect, useRef, useState } from "react";
import { getElement, sleep } from "@/common/utils";
import { isBrowser } from "@/common/constant";
// import ReactPlayer from "react-player";

export default function AdsPlayerComponent({
  adsContent,
  setSkipAds,
}: {
  adsContent?: string | string[];
  setSkipAds?: any;
}) {
  // const playerRef = useRef<ReactPlayer>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [autoPlay, setAutoPlay] = useState(false);

  const playVideo = async () => {
    return await videoRef.current?.play();
  };

  useEffect(() => {
    if (!adsContent) return;
    if (!isBrowser) return;
    setAutoPlay(true);
    videoRef.current?.play();
  }, [isBrowser, adsContent]);

  return (
    <section className="ads-player relative h-[320px] w-full overflow-hidden rounded-xl bg-overlay sm:h-[350px] md:h-[400px] xl:h-[450px] 2xl:h-[600px]">
      {/* <video
        id="ads-before-play"
        className="absolute h-full w-full rounded-lg object-fill"
        ref={videoRef}
        controls={false}
        autoPlay={true}
        preload=""
        onError={(ev) => {
          if (ev.currentTarget.error) {
            setTimeout(() => setSkipAds(true), 1000);
          }
        }}
        onTimeUpdate={async (ev) => {
          const currentTime = ev.currentTarget.currentTime;
          if (currentTime >= 5) {
            const button = getElement(".skip-ads-btn") as any;
            button.style.opacity = 1;
          }
          if (currentTime === videoRef.current?.duration) {
            await sleep(1000);
            setSkipAds(true);
          }
        }}
      >
        {Array.isArray(adsContent) ? (
          adsContent.map((v, index) => (
            <source src={v} key={index.toString() + "pop"} />
          ))
        ) : (
          <source src={adsContent} />
        )}
        Your browser does not support the video tag.
      </video> */}

      <video
        id="ads-before-play"
        className="absolute h-full w-full rounded-lg object-fill"
        ref={videoRef}
        controls={false}
        autoPlay={autoPlay}
        muted
        playsInline
        onClick={playVideo}
        onError={(ev) => {
          if (ev.currentTarget.error) {
            setTimeout(() => setSkipAds(true), 1000);
          }
        }}
        onTimeUpdate={async (ev) => {
          const currentTime = ev.currentTarget.currentTime;
          if (currentTime >= 5) {
            const button = getElement(".skip-ads-btn") as any;
            button.style.opacity = 1;
          }
          if (currentTime === videoRef.current?.duration) {
            await sleep(1000);
            setSkipAds(true);
          }
        }}
        src={adsContent as string}
      >
        {/* {Array.isArray(adsContent) ? (
          adsContent.map((v, index) => (
            <source src={v} key={index.toString() + "pop"} />
          ))
        ) : (
          <source src={adsContent} />
        )} */}
        Your browser does not support the video tag.
      </video>

      {/* <ReactPlayer
        ref={playerRef}
        controls={false}
        width={"100%"}
        height={"100%"}
        playing={true}
        url={adsContent}
        onError={(e, d) => {
          if (d) {
            setTimeout(() => setSkipAds(true), 3000);
          }
        }}
        onProgress={(state) => {
          if (state.playedSeconds >= 5) {
            const button = getElement(".skip-ads-btn") as any;
            button.style.opacity = 1;
          }
          if (state.playedSeconds === playerRef.current?.getDuration()) {
            setTimeout(() => setSkipAds(true), 500);
          }
        }}
        style={{
          objectFit: "fill",
          aspectRatio: "16 / 9",
        }}
      /> */}
      <button
        className="skip-ads-btn absolute bottom-6 right-4 rounded-md bg-danger px-4 py-2 text-base font-semibold opacity-0 transition-all duration-500"
        onClick={() => setSkipAds(true)}
      >
        Bỏ qua quảng cáo
      </button>
    </section>
  );
}
