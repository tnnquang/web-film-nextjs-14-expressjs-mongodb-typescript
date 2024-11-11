"use client";

import { BsPip } from "react-icons/bs";
import { useRef, useState } from "react";
import Slider from "@mui/material/Slider";
import ReactPlayer from "react-player/lazy";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { FaBackwardFast, FaChevronRight } from "react-icons/fa6";
import { IoMdPause, IoMdPlay, IoMdSettings } from "react-icons/io";
import {
  FaFastForward,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";

import { TextTooltipComponent } from "../TooltipComponent";
import { formatPlayedTime, playingTimeOnDuration } from "@/common/utils";

function WrapperPlayer({ children }: { children: React.ReactNode }) {
  return <div className="player-container relative">{children}</div>;
}

export default function HLSPlayer({
  url,
  duration,
}: {
  url: string | string[];
  duration: number | string;
}) {
  let u = url;
  if (typeof u === "string") {
    u = [u];
  }
  const formatLinks = u.map((e) => `https://mc.crogate.online/cors?url=${e}`);

  const videoRef = useRef<ReactPlayer>(null);

  const lstPlaybackRate = [
    {
      value: 0.25,
      text: "0.25x",
    },
    {
      value: 0.5,
      text: "0.5x",
    },
    {
      value: 1,
      text: "Chuẩn",
    },
    {
      value: 2,
      text: "2x",
    },
    {
      value: 2.5,
      text: "2.5x",
    },
    {
      value: 3,
      text: "3x",
    },
  ];

  const [state, setState] = useState({
    pip: false,
    playing: true,
    muted: false,
    playedTime: 0,
    playbackRate: lstPlaybackRate[2],
    volume: 0.6,
    popoverSelectPlaybackRate: false,
    showSettings: false,
    isFullscreen: false,
    showControls: false,
  });

  const handlePlay = () => {
    if (state.playing === true) {
      setState((prevState) => {
        const tmp = { ...prevState };
        tmp.playing = false;
        return tmp;
      });
    } else {
      setState((prevState) => {
        const tmp = { ...prevState };
        tmp.playing = true;
        return tmp;
      });
    }
  };

  const rewind = () => {
    videoRef.current?.seekTo(videoRef.current.getCurrentTime() - 10, "seconds");
  };
  const fastForward = () => {
    videoRef.current?.seekTo(videoRef.current.getCurrentTime() + 10, "seconds");
  };

  const toggleFullScreen = async () => {
    const wrapper = document.getElementById("wrapper-player") as HTMLDivElement;

    if (wrapper) {
      if (!document.fullscreenElement) {
        await wrapper.requestFullscreen();
        const tmp = { ...state };
        tmp.isFullscreen = true;
        setState(tmp);
      } else {
        await document.exitFullscreen();
        const tmp = { ...state };
        tmp.isFullscreen = false;
        setState(tmp);
      }
    }
  };

  const getDuration = (): number => {
    if (videoRef.current) {
      return videoRef.current.getDuration();
    } else return 0;
  };

  const seekTo = (second: number) => {
    return videoRef.current?.seekTo(second);
  };

  return (
    <div
      id="wrapper-player"
      className="relative w-full shadow-1 overflow-hidden rounded-xl mt-6 bg-secondary bg-opacity-55"
      onMouseLeave={() => {
        const tmp = { ...state };
        setTimeout(() => {
          tmp.showControls = false;
          setState(tmp);
        }, 3000);
      }} //rời khỏi phần tử
      // onMouseOut={}
      onMouseOver={() => {
        const tmp = { ...state };
        tmp.showControls = true;
        setState(tmp);
      }} //di chuyển vào trong phần tử
    >
      <ReactPlayer
        wrapper={WrapperPlayer}
        ref={videoRef}
        url={formatLinks[0]}
        playing={state.playing}
        muted={state.muted}
        volume={state.volume}
        playsinline
        width="100%"
        height="100%"
        playIcon={<FaPlay size={30} className="text-primary" />}
        pip={state.pip}
        stopOnUnmount={false}
        playbackRate={state.playbackRate.value}
        onProgress={(st) => {
          setState((prevState) => {
            const tmp = { ...prevState };
            tmp.playedTime = st.playedSeconds;
            return tmp;
          });
        }}
        fallback={
          <div className="flex items-center justify-center h-full w-full bg-secondary bg-opacity-70 relative animate-pulse">
            Đang tải trình phát video...
          </div>
        }
        config={{
          file: {
            forceHLS: true,
          },
        }}
        style={{
          aspectRatio: "16/9",
        }}
      />
      <div
        className={`absolute z-10 w-full h-full ${
          state.playing === false ? "bg-slate-300 bg-opacity-10" : ""
        } top-0 left-0 flex items-center justify-center`}
        onClick={handlePlay}
      >
        {state.playing === false && (
          <span className="play-custom-btn hover:cursor-pointer">
            <FaPlay size={40} />
          </span>
        )}
      </div>
      <div
        className={`player-controls absolute w-full h-14 bg bg-primary bg-opacity-75 transition-all duration-300 ${
          state.showControls
            ? " visible opacity-100 bottom-0 z-50"
            : "opacity-0 invisible -bottom-14 z-[-1]"
        }`}
      >
        <div className="relative progress-container w-[98%] mx-auto h-1.5 bg-gray-300 rounded-md">
          {/* <div
            className="relative progressing bg-red-500 transition-all duration-75 h-full rounded-md"
            style={{
              width: `${100 * (state.playedTime / getDuration())}%`,
            }}
          ></div> */}
          <Slider
            value={state.playedTime}
            min={0}
            max={getDuration()}
            onChange={(ev, val) => seekTo(val as number)}
            // step={state.playedTime}
            size="medium"
            color="error"
            className="!m-0 !p-0 !h-full -top-3"
          />
        </div>
        <div className="controls flex items-center justify-between h-[50px]">
          <div className="left-controls flex items-center justify-start gap-4 pl-3">
            <button className="play-btn p-1 rounded-full" onClick={handlePlay}>
              {state.playing ? <IoMdPause size={24} /> : <IoMdPlay size={24} />}
            </button>

            <div className="volume-container flex items-center gap-2">
              <button
                className="volume-btn"
                onClick={() => {
                  // setMuted((prevState) => !prevState)
                  const tmp = { ...state };
                  tmp.muted = !tmp.muted;
                  return tmp;
                }}
              >
                {state.muted || state.volume === 0 ? (
                  <FaVolumeMute size={16} />
                ) : (
                  <FaVolumeUp size={16} />
                )}
              </button>
              <Slider
                value={state.volume}
                onChange={(e, v) => {
                  const tmp = { ...state };
                  tmp.volume = v as number;
                  setState(tmp);
                }}
                aria-label="Volume"
                size="small"
                step={0.1}
                min={0}
                max={1}
                className="!w-[100px]"
                color="warning"
              />
            </div>
            <div className="forward-time flex items-center gap-2">
              <button
                className="rewind relative flex flex-col justify-center items-center p-1.5 rounded-full hover:bg-secondary"
                onClick={rewind}
              >
                <FaBackwardFast size={14} />
              </button>
              <button
                className="relative flex flex-col justify-center items-center p-1.5 rounded-full hover:bg-secondary"
                onClick={fastForward}
              >
                <FaFastForward size={14} />
              </button>
            </div>
            <div className="time-played text-sm">
              {playingTimeOnDuration(
                formatPlayedTime(state.playedTime.toFixed(0)),
                formatPlayedTime(duration)
              )}
            </div>
          </div>
          <div className="right-controls flex items-center gap-4 justify-start pr-3 w-[250px]">
            <div className="options-control relative">
              <button
                onClick={() => {
                  const tmp = { ...state };
                  tmp.showSettings = !tmp.showSettings;
                  setState(tmp);
                }}
                className="btn-option-control p-1.5 rounded-full hover:bg-secondary hover:rotate-90 transition-all duration-200"
              >
                <IoMdSettings size={16} />
              </button>
              <div
                onBlur={() => {
                  const tmp = { ...state };
                  tmp.showSettings = false;
                  setState(tmp);
                }}
                className={`list-options ${
                  state.showSettings ? "active" : ""
                } absolute -top-[210px] -left-3 w-[250px] p-4 rounded-md bg-primary h-[180px] overflow-y-auto`}
              >
                <div className="flex items-center justify-between gap-4 p-1.5 transition-all duration-200 hover:bg-slate-400 hover:bg-opacity-15 hover:cursor-pointer rounded-md text-sm">
                  <button
                    className="playback-rate play-speed"
                    onClick={() => {
                      const tmp = { ...state };
                      tmp.popoverSelectPlaybackRate = true;
                      setState(tmp);
                    }}
                  >
                    Tốc độ phát
                  </button>

                  <span className="play-speed-text flex items-center gap-2">
                    {state.playbackRate.text}
                    <FaChevronRight size={12} />
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 p-1.5 transition-all duration-200 hover:bg-slate-400 hover:bg-opacity-15 hover:cursor-pointer rounded-md text-sm">
                  <button className="playback-rate play-speed">
                    Chất lượng
                  </button>

                  <span className="play-speed-text flex items-center gap-2">
                    HD
                  </span>
                </div>

                {state.popoverSelectPlaybackRate && (
                  <div className="absolute z-50 bg-primary w-full h-full top-0 left-0 rounded-md text-sm px-2 py-3">
                    {lstPlaybackRate.map((e) => (
                      <button
                        key={e.value}
                        onClick={() => {
                          const tmp = { ...state };
                          tmp.playbackRate = e;
                          tmp.popoverSelectPlaybackRate = false;
                          setState(tmp);
                        }}
                        className="play-speed-text-btn flex items-center justify-between w-full gap-2 transition-all duration-200 hover:bg-slate-400 hover:bg-opacity-15 hover:cursor-pointer p-1.5 rounded-md"
                      >
                        {e.text}
                        {/* <span className="">{e.value}</span> */}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <TextTooltipComponent
              value={"Trình phát thu nhỏ"}
              className="p-1.5 hover:bg-secondary transition-all duration-300 rounded-full"
            >
              <button
                className="pip w-full block"
                onClick={() =>
                  setState((prevState) => {
                    const tmp = { ...prevState };
                    tmp["pip"] = !tmp["pip"];
                    return tmp;
                  })
                }
              >
                <BsPip size={16} />
              </button>
            </TextTooltipComponent>
            <TextTooltipComponent
              onClick={toggleFullScreen}
              value={
                !state.isFullscreen
                  ? "Chế độ toàn màn hình"
                  : "Tắt chế độ toàn màn hình"
              }
              className="fullscreen-btn flex items-center justify-center rounded-full p-1 transition-all duration-300 hover:bg-secondary"
            >
              {!state.isFullscreen ? (
                <MdFullscreen size={24} />
              ) : (
                <MdFullscreenExit size={24} />
              )}
            </TextTooltipComponent>
          </div>
        </div>
      </div>
    </div>
  );
}
