"use client";

import { BsPip } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import Slider from "@mui/material/Slider";
import ReactPlayer from "react-player/lazy";
import { MdFullscreenExit } from "react-icons/md";
import {
  FaBackwardFast,
  FaCalendarDays,
  FaChevronRight,
} from "react-icons/fa6";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import {
  FaFastForward,
  FaPlay,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";


import { getFullDate } from "@/common/utils";
import { ImEnlarge2 } from "react-icons/im";
import { BiMicrophone } from "react-icons/bi";
import { GrMapLocation } from "react-icons/gr";
import { isEmpty } from "lodash";
import LoadingComponent from "../LoadingComponents/Spinner";
import { TextTooltipComponent } from "../TooltipComponent";

function WrapperPlayer({ children }: { children: React.ReactNode }) {
  return (
    <div className={`player-container relative lg:min-h-[350px]`}>
      {children}
    </div>
  );
}

export default function VideoPlayerComponent({
  url,
  duration,
  isHLS = false,
  autoPlay = true,
  dataInfo,
}: // videoAds
{
  url: {
    mainVideo: string | [{ name: string; url: string }];
    listAds?: null | any;
  };
  duration?: number | string;
  isHLS?: boolean;
  dataInfo?: any;
  autoPlay?: boolean;
  // videAds?: any
}) {
  let u = url?.mainVideo;
  if (typeof u === "string") {
    u = [{ name: "Link 1", url: u }];
  }
  const formatLinks = u;
  // console.log("formatLinks", formatLinks);

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

  const [playing, setPlaying] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [skipAds, setSkipAds] = useState(false);
  const [adsPlaying, setAdsPlaying] = useState(true);

  const [state, setState] = useState({
    pip: false,
    muted: false,
    playedTime: 0,
    playbackRate: lstPlaybackRate[2],
    volume: 0.6,
    popoverSelectPlaybackRate: false,
    showSettings: false,
    showControls: false,
    videoUrl: url.listAds ? url.listAds[1].content : formatLinks[0].url,
  });

  const handleReady = () => {
    setLoading(false);
    setError(false);
  };

  const handleBuffer = () => {
    setLoading(true);
  };

  const handleBufferEnd = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handlePlay = () => {
    setPlaying((prev) => !prev);
  };

  const rewind = () => {
    videoRef.current?.seekTo(videoRef.current.getCurrentTime() - 10, "seconds");
  };
  const fastForward = () => {
    videoRef.current?.seekTo(videoRef.current.getCurrentTime() + 10, "seconds");
  };

  // console.log("loaddingggg, ", loading, error);

  // const toggleFullScreen = async () => {
  //   const wrapper = document.getElementById("wrapper-player") as any;
  //   setIsFullScreen(!isFullScreen);
  //   const d = document as any;
  //   if (isFullScreen) {
  //     // Tắt chế độ Fullscreen
  //     if (d?.exitFullscreen) {
  //       await d?.exitFullscreen();
  //     } else if (d?.webkitExitFullscreen) {
  //       d?.webkitExitFullscreen();
  //     } else if (d?.mozCancelFullScreen) {
  //       d?.mozCancelFullScreen();
  //     }
  //   } else {
  //     // Bật chế độ Fullscreen
  //     if (wrapper.requestFullscreen) {
  //       await wrapper.requestFullscreen();
  //     } else if (wrapper.webkitRequestFullscreen) {
  //       await wrapper.webkitRequestFullscreen();
  //     } else if (wrapper.mozRequestFullscreen) {
  //       await wrapper.mozRequestFullscreen();
  //     }
  //   }

  //   const oppositeOrientation = screen.orientation.type.startsWith("portrait")
  //     ? "landscape-secondary"
  //     : "portrait";
  // };

  const playerContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      // Vào chế độ toàn màn hình
      if (playerContainerRef.current) {
        if ((playerContainerRef.current as any)?.requestFullscreen) {
          await (playerContainerRef.current as any)?.requestFullscreen();
        } else if ((playerContainerRef.current as any)?.mozRequestFullScreen) {
          /* Firefox */
          await (playerContainerRef.current as any)?.mozRequestFullScreen();
        } else if (
          (playerContainerRef.current as any)?.webkitRequestFullscreen
        ) {
          /* Chrome, Safari & Opera */
          await (playerContainerRef.current as any)?.webkitRequestFullscreen();
        } else if ((playerContainerRef.current as any)?.msRequestFullscreen) {
          /* IE/Edge */
          await (playerContainerRef.current as any)?.msRequestFullscreen();
        }

        // Đổi hướng màn hình sang landscape
        if (screen.orientation && (screen.orientation as any)?.lock) {
          try {
            await (screen.orientation as any)?.lock("landscape-secondary");
          } catch (error) {
            console.error("Orientation lock failed:", error);
          }
        } else if (
          window.screen.orientation &&
          (window.screen.orientation as any)?.lock
        ) {
          (window.screen.orientation as any)
            ?.lock("landscape-secondary")
            .catch((error: any) => {
              console.error("Orientation lock failed:", error);
            });
        } else {
          console.warn(
            "Screen Orientation API is not supported in this browser."
          );
        }

        setIsFullScreen(true);
      }
    } else {
      // Thoát chế độ toàn màn hình
      if ((document as any)?.exitFullscreen) {
        await (document as any)?.exitFullscreen();
      } else if ((document as any)?.mozCancelFullScreen) {
        /* Firefox */
        await (document as any)?.mozCancelFullScreen();
      } else if ((document as any)?.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        await (document as any)?.webkitExitFullscreen();
      } else if ((document as any)?.msExitFullscreen) {
        /* IE/Edge */
        await (document as any)?.msExitFullscreen();
      }

      // Khôi phục lại hướng màn hình ban đầu
      if (screen.orientation && screen.orientation.unlock) {
        try {
          screen.orientation.unlock();
        } catch (error) {
          console.error("Orientation unlock failed:", error);
        }
      }

      setIsFullScreen(false);
    }
  };

  // const toggleFullScreen = async () => {
  //   if (!isFullScreen) {
  //     // Chế độ giả fullscreen
  //     if (playerContainerRef.current) {
  //       playerContainerRef.current.style.position = "fixed";
  //       playerContainerRef.current.style.top = "0";
  //       playerContainerRef.current.style.left = "0";
  //       playerContainerRef.current.style.width = "100vw";
  //       playerContainerRef.current.style.height = "100lvh";
  //       playerContainerRef.current.style.zIndex = "9999";
  //       playerContainerRef.current.style.backgroundColor = "black";
  //       playerContainerRef.current.style.overflow = "hidden";

  //       // Ẩn thanh điều hướng và thanh địa chỉ trên iOS Safari
  //       document.documentElement.style.overflow = "hidden";
  //       document.body.style.overflow = "hidden";
  //       (document.getElementById("main") as any).style.zIndex = 100;
  //       window.scrollTo(0, 0);

  //       // Khóa hướng màn hình sang landscape
  //       if (screen.orientation && (screen.orientation as any)?.lock) {
  //         try {
  //           await (screen.orientation as any)?.lock("landscape-secondary");
  //         } catch (error) {
  //           console.error("Orientation lock failed:", error);
  //         }
  //       }

  //       setIsFullScreen(true);
  //     }
  //   } else {
  //     // Thoát chế độ giả fullscreen
  //     if (playerContainerRef.current) {
  //       playerContainerRef.current.style.position = "";
  //       playerContainerRef.current.style.top = "";
  //       playerContainerRef.current.style.left = "";
  //       playerContainerRef.current.style.width = "";
  //       playerContainerRef.current.style.height = "";
  //       playerContainerRef.current.style.zIndex = "";
  //       playerContainerRef.current.style.backgroundColor = "";
  //       playerContainerRef.current.style.overflow = "";

  //       // Khôi phục lại thanh điều hướng và thanh địa chỉ trên iOS Safari
  //       document.documentElement.style.overflow = "";
  //       document.body.style.overflow = "";
  //       (document.getElementById("main") as any).style.zIndex = 10;

  //       // Khôi phục lại hướng màn hình ban đầu
  //       if (screen.orientation && screen.orientation.unlock) {
  //         try {
  //           screen.orientation.unlock();
  //         } catch (error) {
  //           console.error("Orientation unlock failed:", error);
  //         }
  //       }

  //       setIsFullScreen(false);
  //     }
  //   }
  // };

  const getDuration = (): number => {
    if (videoRef.current) {
      return videoRef.current.getDuration();
    }
    return 0;
  };

  const seekTo = (second: number) => {
    return videoRef.current?.seekTo(second);
  };

  // const [heightChat, setHeightChat] = useState<string | number | undefined>(
  //   "auto"
  // );
  // useEffect(() => {
  //   if (state.videoUrl) {
  //     setHeightChat(document.getElementsByTagName("video")[0]?.videoHeight);
  //   }
  // }, [state.videoUrl]);

  useEffect(() => {
    if (!isHLS) return;
    if (isHLS === true) {
      setPlaying(true);
    }
  }, [isHLS]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 pt-1 pb-2 w-full px-2 bg-bgPlayer lg:bg-none rounded-t-xl">
        <div className="server-play flex items-center justify-start gap-1 basis-2/3 sm:basis-4/5 lg:basis-[90%] overflow-x-auto">
          {!adsPlaying &&
            formatLinks?.map((e: { name: string; url: string }, i: number) => (
              <button
                key={i.toString() + "aa"}
                className={`item-link text-nowrap whitespace-nowrap transition-all duration-300 py-1 px-2 rounded-md text-sm font-bold uppercase border hover:opacity-80 active:opacity-80  ${
                  e.url === state.videoUrl
                    ? " bg-white border-textDark"
                    : " bg-xemngay text-textDark border-xemngay"
                }`}
                onClick={() => {
                  const tmp = { ...state };
                  tmp.videoUrl = e.url;
                  setState(tmp);
                  setLoading(true);
                  setError(false);
                }}
              >
                {e.name}
              </button>
            ))}
        </div>
        <button
          onClick={toggleFullScreen}
          className="zoom basis-1/3 sm:basis-1/5 lg:basis-[10%] py-1 px-3 text-sm text-textDark text-nowrap bg-white rounded-lg hover:opacity-80 active:opacity-80"
        >
          Phóng to
        </button>
      </div>
      <div className="flex flex-col lg:flex-row items-start ">
        <div className="w-full watch-video bg-bgPlayer lg:bg-none lg:basis-full rounded-xl overflow-hidden">
          <div
            ref={playerContainerRef}
            id="wrapper-player"
            className="relative w-full shadow-1 overflow-hidden rounded-xl bg-secondary bg-opacity-40"
          >
            <ReactPlayer
              wrapper={WrapperPlayer}
              ref={videoRef}
              url={state.videoUrl}
              playing={playing}
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
                if (adsPlaying) {
                  if (st.playedSeconds >= 5) {
                    setSkipAds(true);
                    if (st.playedSeconds == getDuration()) {
                      setTimeout(() => {}, 1000);
                      setAdsPlaying(false);
                      setSkipAds(false);
                      const tmp = { ...state };
                      tmp.videoUrl = formatLinks[0].url;
                      setState(tmp);
                    }
                  }
                }
                setState((prevState) => {
                  const tmp = { ...prevState };
                  tmp.playedTime = st.playedSeconds;
                  return tmp;
                });
              }}
              fallback={
                <div className="flex items-center justify-center h-[300px] w-full bg-secondary bg-opacity-70 relative animate-pulse">
                  Đang tải trình phát video...
                </div>
              }
              onReady={handleReady}
              onBuffer={handleBuffer}
              onBufferEnd={handleBufferEnd}
              onError={(err, data, instance, hlsGlobal) => {
                // console.log(
                //   "Error neeee",
                //   err,
                //   "error data",
                //   data,
                //   "instance",
                //   instance,
                //   "hlsGlobal",
                //   hlsGlobal
                // );
                handleError();
              }}
              config={{
                file: { forceHLS: adsPlaying ? false : isHLS ? true : false },
                // file: true
                //   ? undefined
                //   : {
                //       forceHLS: true,
                //       forceVideo: true
                //     },
              }}
              style={{
                aspectRatio: "16/9",
                overflow: "hidden",
                borderRadius: 12,
              }}
            />
            {skipAds && (
              <button
                onClick={() => {
                  setSkipAds(false);
                  setAdsPlaying(false);
                  const tmp = { ...state };
                  tmp.videoUrl = formatLinks[0].url;
                  setState(tmp);
                }}
                className="active:opacity-80 focus:opacity-80 hover:opacity-80 absolute bottom-6 right-2 py-2 text-center px-3 text-lg rounded-md bg-red-600 text-white"
              >
                Bỏ qua quảng cáo {">>"}
              </button>
            )}
            {error && (
              <div
                className={`absolute backdrop-blur-[8px] bg-black bg-opacity-25 z-10 w-full h-full top-0 left-0 flex flex-col items-center justify-center`}
              >
                <p className="font-semibold text-base text-center py-2 text-white">
                  Tải video bị lỗi
                </p>
              </div>
            )}
            {loading && (
              <div
                className={`absolute z-10 w-full h-full top-0 left-0 flex flex-col items-center justify-center`}
              >
                <LoadingComponent />
                <p className="font-semibold text-base text-center py-2 text-white">
                  Đang tải
                </p>
              </div>
            )}
            {!isHLS && (
              <div
                className={`absolute z-10 w-full h-full ${
                  playing === false ? "bg-slate-300 bg-opacity-10" : ""
                } top-0 left-0 flex items-center justify-center`}
                onClick={handlePlay}
              >
                {playing === false && (
                  <span className="play-custom-btn hover:cursor-pointer">
                    <FaPlay size={40} />
                  </span>
                )}
              </div>
            )}
            {!adsPlaying && (
              <div
                className={`player-controls absolute w-full h-14 bg bg-primary bg-opacity-5 transition-all duration-300 `}
              >
                {!isHLS && (
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
                )}
                <div className="controls flex items-center justify-between h-[50px]">
                  <div className="left-controls flex items-center justify-start gap-4 pl-3">
                    {isHLS ? (
                      <span className="uppercase text-red-500 text-xs font-bold">
                        LIVE
                      </span>
                    ) : (
                      <button
                        className="play-btn p-1 rounded-full"
                        onClick={handlePlay}
                      >
                        {playing ? (
                          <IoMdPause size={24} color="#fff" />
                        ) : (
                          <IoMdPlay size={24} color="#fff" />
                        )}
                      </button>
                    )}

                    <div className="volume-container flex items-center gap-2">
                      <button
                        className="volume-btn"
                        onClick={() => {
                          // console.log("click icon ne hehehe");
                          // setMuted((prevState) => !prevState)
                          const tmp = { ...state };
                          tmp.muted = !tmp.muted;
                          setState(tmp);
                        }}
                      >
                        {state.muted || state.volume === 0 ? (
                          <FaVolumeMute size={16} color="#fff" />
                        ) : (
                          <FaVolumeUp size={16} color="#fff" />
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
                        className="!w-[70px] sm:!w-[100px]"
                        color="warning"
                      />
                    </div>
                    {!isHLS && (
                      <div>
                        <div className="forward-time flex items-center gap-2">
                          <button
                            className="rewind relative flex flex-col justify-center items-center p-1.5 rounded-full hover:bg-secondary"
                            onClick={rewind}
                          >
                            <FaBackwardFast size={14} color="#fff" />
                          </button>
                          <button
                            className="relative flex flex-col justify-center items-center p-1.5 rounded-full hover:bg-secondary"
                            onClick={fastForward}
                          >
                            <FaFastForward size={14} color="#fff" />
                          </button>
                        </div>
                        {/* <div className="time-played text-sm">
                      {playingTimeOnDuration(
                        formatPlayedTime(state.playedTime.toFixed(0)),
                        formatPlayedTime(duration)
                      )}
                    </div> */}
                      </div>
                    )}
                  </div>
                  <div
                    className={`right-controls flex items-center gap-1.5 sm:gap-4 justify-end  pr-3 max-w-[250px]`}
                  >
                    <button className="datcuoc bg-datcuoc uppercase font-bold text-xs md:text-sm text-white px-1 sm:px-3 py-1 rounded-lg hover:opacity-80 active:opacity-80 focus:opacity-80">
                      Đặt cược
                    </button>
                    {!isHLS && (
                      <>
                        <div className="options-control relative">
                          {/* <button
                          onClick={() => {
                            const tmp = { ...state };
                            tmp.showSettings = !tmp.showSettings;
                            setState(tmp);
                          }}
                          className="btn-option-control p-1.5 rounded-full hover:bg-secondary hover:rotate-90 transition-all duration-200"
                        >
                          <IoMdSettings size={16} color="#fff" />
                        </button> */}
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
                                <FaChevronRight size={12} color="#fff" />
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
                      </>
                    )}
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
                        <BsPip size={16} color="#fff" />
                      </button>
                    </TextTooltipComponent>
                    <TextTooltipComponent
                      onClick={toggleFullScreen}
                      value={
                        !isFullScreen
                          ? "Chế độ toàn màn hình"
                          : "Tắt chế độ toàn màn hình"
                      }
                      className="fullscreen-btn flex items-center justify-center rounded-full p-1 transition-all duration-300 hover:bg-secondary"
                    >
                      {!isFullScreen ? (
                        <ImEnlarge2 size={18} color="#fff" />
                      ) : (
                        <MdFullscreenExit size={24} color="#fff" />
                      )}
                    </TextTooltipComponent>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className=" bg-redBottomPlayer rounded-b-xl flex flex-wrap items-center justify-between p-2 gap-2 text-xs w-full text-white lg:hidden">
          <button
            onClick={() => {
              const dataStatistic = document.getElementById(
                "wrapper-statistics"
              ) as HTMLDivElement;
              dataStatistic?.classList.toggle("active");
            }}
            className="statics-show rounded-lg p-1 bg-xemngay text-textDark text-nowrap active:opacity-80 hover:opacity-80 max-w-[62px]"
          >
            Thống kê
          </button>
          {dataInfo && (
            <>
              <p className="date-time flex items-center gap-1">
                <FaCalendarDays size={14} />
                <span>
                  {getFullDate(+dataInfo.start_at * 1000).fullTimeDate}
                </span>
              </p>
              <p className="commentator flex items-center gap-1 ">
                <BiMicrophone size={14} />
                <span className="">Biahoi.live</span>
              </p>
              <p className="venue flex items-center gap-1 max-w-[160px] line-clamp-2">
                <GrMapLocation size={14} className="font-bold" />
                {dataInfo.venue.name && (
                  <span
                    className="inline-block line-clamp-2"
                    style={{ width: "calc(100% - 14px - 4px)" }}
                  >
                    {dataInfo.venue.name}
                  </span>
                )}
              </p>
            </>
          )}
          {/* <button
            onClick={() => {
              const chatting = document.getElementsByClassName(
                "chatting"
              )[0] as HTMLDivElement;
              chatting?.classList.toggle("active");
            }}
            className="text-white rounded-lg bg-bgGreen p-1 text-nowrap active:opacity-80 hover:opacity-80 max-w-[62px]"
          >
            Chém gió
          </button> */}
        </div>
        {/* <div className="rounded-b-xl overflow-hidden w-full chatting basis-full lg:basis-1/3 bg-black lg:pl-2">
          <iframe
            src={`https://www5.cbox.ws/box/?boxid=950237&boxtag=psuYh4`}
            allow="autoplay"
            height={400}
            className="w-full rounded-b-xl"
          ></iframe>
        </div> */}
      </div>
    </div>
  );
}

export function EmbedURLComponent({ url }: { url: string }) {
  return (
    <div className="w-full relative bg-xemngay bg-opacity-55 rounded-xl overflow-hidden flex items-center justify-center mt-4 min-h-[330px]">
      {!isEmpty(url) ? (
        <div className="w-full h-full">
          <iframe src={url} className="w-full" height={450} />
          <div className=" bg-redBottomPlayer rounded-b-xl flex flex-wrap items-center justify-between p-2 gap-2 text-xs w-full text-white lg:hidden">
            <button
              onClick={() => {
                const dataStatistic = document.getElementById(
                  "wrapper-statistics"
                ) as HTMLDivElement;
                dataStatistic?.classList.toggle("active");
              }}
              className="statics-show rounded-lg p-1 bg-xemngay text-textDark text-nowrap active:opacity-80 hover:opacity-80 max-w-[62px]"
            >
              Thống kê
            </button>

            {/* <button
              onClick={() => {
                const chatting = document.getElementsByClassName(
                  "chatting"
                )[0] as HTMLDivElement;
                chatting?.classList.toggle("active");
              }}
              className="text-white rounded-lg bg-bgGreen p-1 text-nowrap active:opacity-80 hover:opacity-80 max-w-[62px]"
            >
              Chém gió
            </button> */}
          </div>
        </div>
      ) : (
        <span className="font-bold text-datcuoc text-xl">Không có dữ liệu</span>
      )}
    </div>
  );
}
