"use client";

import { Tabs } from "antd";
import { isEmpty } from "lodash";
import dynamic from "next/dynamic";
import ReactPlayer from "react-player/lazy";
import React, { useEffect, useState } from "react";
import {
  FaCirclePlay,
  FaFacebook,
  FaOdnoklassniki,
  FaTwitter,
  FaVk,
} from "react-icons/fa6";
import {
  FacebookShareButton,
  OKShareButton,
  TwitterShareButton,
  VKShareButton,
} from "react-share";

import { IFilm } from "@/configs/types";
import { initFacebook } from "../InitFB";
import HLSPlayerComponent from "../Players/HLSPlayer";
import IframePlayerComponent from "../Players/EmbedPlayer";
import {
  BASE_URL_API,
  UPDATE_VIEW,
  fetchOrigin,
  isBrowser,
} from "@/common/constant";

import { getElement, scrollToTop, toCapitalize } from "@/common/utils";
import { MdLightMode } from "react-icons/md";

const AdsPlayerComponent = dynamic(
  async () => await import("../Players/AdsPlayerComponent"),
  { ssr: false }
);

// const CommentComponent = dynamic(
//   async () => await import("@/components/Comment")
// );

export default function HandlePlayVideoComponent({
  item,
  adsInPlayer,
}: {
  item: any;
  adsInPlayer?: any;
}) {
  const [currentEp, setCurrentEp] = useState<any>(null);
  const [itemsTab, setItemsTab] = useState<any[]>([]);
  const [skipAds, setSkipAds] = useState(false);

  const getCurrentTab = (item: IFilm) => {
    if (isEmpty(item) || isEmpty(item.list_episode)) return [];

    return item.list_episode!.map((el: any, index: number) => ({
      key: index.toString() + "oli",
      label: <p className="text-base font-medium text-white">{el.name}</p>,
      children: (
        <div className="list-link-grid grid max-h-[400px] grid-cols-3 items-center justify-start gap-1.5 overflow-y-auto px-1.5 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 ">
          {el.list_link.map((v: any, index: number) => {
            return (
              <button
                key={`a${index}`}
                onClick={() => {
                  setCurrentEp(v);
                  scrollToTop(0);
                  console.log(
                    "check current vs v",
                    currentEp.link,
                    v.link,
                    " currentEp?.link === v?.link => ",
                    currentEp?.link === v?.link
                  );
                }}
                className={`btn-ep inline-block w-full rounded-xl transition-all duration-300 hover:opacity-80 ${
                  currentEp?.link === v?.link
                    ? "bg-blueSecondary text-white"
                    : "bg-white text-blueSecondary"
                } border border-blueSecondary p-1.5 text-center`}
                type="button"
              >
                {v.title?.trim().toLowerCase().startsWith("tập")
                  ? toCapitalize(v.title)
                  : `Tập ${v.title}`}
              </button>
            );
          })}
        </div>
      ),
    }));
  };

  useEffect(() => {
    if (!item) return;
    if (!isEmpty(item.list_episode)) {
      // const length = item.list_episode.length - 1;
      setCurrentEp(item.list_episode[0].list_link[0]);
    }
    const _itemsTab = getCurrentTab(item);
    setItemsTab(_itemsTab);
  }, [item]);

  useEffect(() => {
    if (!isBrowser) return;
    initFacebook();
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = `https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v19.0&appId=${process.env.NEXT_PUBLIC_FB_APP_ID}`;
    script.nonce = process.env.NEXT_PUBLIC_FB_NONCE;
    document.body.appendChild(script);
    // return () => document.body.removeChild(script);
  }, [isBrowser]);

  useEffect(() => {
    const incrementView = process.env.NEXT_PUBLIC_TIME_INCREMENT_VIEW
      ? +process.env.NEXT_PUBLIC_TIME_INCREMENT_VIEW
      : 10000;
    const timeOut = setTimeout(async () => {
      const data = await fetch(`${BASE_URL_API}${UPDATE_VIEW}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...fetchOrigin,
        },
        body: JSON.stringify({ name: item.title }),
      });
      if (data.ok) {
        // console.log("Increment view is ok");
      }
    }, incrementView);
    return () => clearTimeout(timeOut);
  }, []);

  useEffect(() => {
    if (isEmpty(adsInPlayer)) {
      setSkipAds(true);
    }
  }, [adsInPlayer]);

  if (!item || !currentEp)
    return (
      <div className="relative mb-2 mt-8 flex h-[400px] w-full max-w-full animate-pulse items-center justify-center rounded-xl bg-brandLinear bg-opacity-20 xl:h-[500px] 2xl:h-[550px]">
        <FaCirclePlay size={44} />
      </div>
    );

  // const VideoShow = () => {
  //   // Kiểm tra điều kiện hiển thị video ads
  //   if (!skipAds && !isEmpty(adsInPlayer)) {
  //     return (
  //       <div className="h-[320px] w-full sm:h-[350px] md:h-[400px] xl:h-[450px] 2xl:h-[600px]">
  //         <AdsPlayerComponent
  //           adsContent={adsInPlayer?.ads_content[1]?.content}
  //           setSkipAds={setSkipAds}
  //         />
  //       </div>
  //     );
  //   }

  //   // Kiểm tra điều kiện hiển thị video chính
  //   if (!isEmpty(currentEp?.link)) {
  //     // Kiểm tra xem link có hợp lệ hay không
  //     if (
  //       currentEp?.link.trim().endsWith("m3u8") &&
  //       !(currentEp?.link.trim() as string).startsWith(
  //         "https://player.phimapi.com"
  //       )
  //     ) {
  //       return <HLSPlayerComponent videoLink={currentEp?.link} />;
  //     } else {
  //       return <IframePlayerComponent videoLink={currentEp?.link} />;
  //     }
  //   } else if (item.trailer_url) {
  //     // Kiểm tra xem trailer_url có hợp lệ hay không
  //     return (
  //       <div className="h-[320px]  w-full sm:h-[350px] md:h-[400px] xl:h-[450px] 2xl:h-[600px]">
  //         <ReactPlayer
  //           url={item.trailer_url}
  //           width="100%"
  //           height="100%"
  //           controls
  //           playing
  //         />
  //       </div>
  //     );
  //   } else {
  //     // Hiển thị thông báo "Phim đang được cập nhật"
  //     return (
  //       <p className="text-center text-base font-bold text-white">
  //         Phim đang được cập nhật
  //       </p>
  //     );
  //   }
  // };

  const VideoShow = () => {
    // Kiểm tra điều kiện hiển thị video ads
    if (!skipAds && !isEmpty(adsInPlayer)) {
      return (
        <div className="h-[320px] w-full sm:h-[350px] md:h-[400px] xl:h-[450px] 2xl:h-[600px]">
          <AdsPlayerComponent
            adsContent={adsInPlayer?.ads_content[1]?.content}
            setSkipAds={setSkipAds}
          />
        </div>
      );
    }

    // Kiểm tra điều kiện hiển thị video chính
    if (!isEmpty(currentEp?.link)) {
      // Kiểm tra xem link có hợp lệ hay không
      if (
        currentEp?.link?.trim().endsWith("m3u8") &&
        !(currentEp?.link?.trim() as string).startsWith(
          "https://player.phimapi.com"
        )
      ) {
        return <HLSPlayerComponent videoLink={currentEp?.link} />;
      } else {
        return <IframePlayerComponent videoLink={currentEp?.link} />;
      }
    } else if (item.trailer_url) {
      // Kiểm tra xem trailer_url có hợp lệ hay không
      return (
        <div className="h-[320px] w-full sm:h-[350px] md:h-[400px] xl:h-[450px] 2xl:h-[600px]">
          <ReactPlayer
            url={item.trailer_url}
            width="100%"
            height="100%"
            controls
            playing
          />
        </div>
      );
    } else {
      // Hiển thị thông báo "Phim đang được cập nhật" hoặc "Tập này đang bị lỗi"
      const errorMessage =
        currentEp?.link === null
          ? `Tập ${currentEp?.title || "này"} đang bị lỗi.\nDữ liệu trả về: ${currentEp?.link}`
          : "Phim đang được cập nhật";
      return (
        <p className="flex min-h-[300px] items-center justify-center text-center text-base font-bold text-white">
          {errorMessage}
        </p>
      );
    }
  };

  const turnOffLightHandle = () => {
    const el = getElement("#light-out") as HTMLDivElement;
    const watchFilmEl = getElement(".watch-film-container") as HTMLElement;
    el.classList.toggle("active");
    watchFilmEl.classList.toggle("active");
    getElement(".main-container")?.classList.toggle("active");
    getElement("#header-container")?.classList.toggle("hidden");
    scrollToTop(10);
  };

  // const expandHandle = () => {
  //   const videoPlayer = getElement(".video-player-container") as HTMLDivElement; //get height
  //   const sideRight = getElement(".side-right") as HTMLElement; // margin top = height videoPlayer

  //   sideRight.style.marginTop = `${videoPlayer.clientHeight}px`;
  // };

  return (
    <React.Fragment>
      <section className="watch-film-container relative mt-8 w-full">
        <div
          className={`video-player-container relative ${!currentEp.link && !item.trailer_url ? "flex items-center justify-center" : "animate-pulse"} w-full !overflow-hidden rounded-xl border border-blueSecondary bg-opacity-50`}
        >
          <VideoShow />
        </div>
        <div className="my-2 flex w-full items-center justify-end">
          {/* <button
            onClick={expandHandle}
            className="btn-light-out flex items-center gap-1 rounded-md bg-blueSecondary p-1 text-center text-xs text-white"
          >
            <MdLightMode /> <span className="">Mở rộng</span>
          </button> */}
          <button
            onClick={turnOffLightHandle}
            className="btn-light-out flex items-center gap-1 rounded-md bg-blueSecondary p-1 text-center text-xs text-white"
          >
            <MdLightMode /> <span className="text-light-out"></span>
          </button>
        </div>
        {skipAds &&
        item?.quality !== "Trailer" &&
        (item?.total_episode === "Tập FULL" ||
          item?.list_episode[0]?.list_link?.length >= +item?.total_episode) ? (
          <p className=" mx-auto -mt-8 w-max rounded-md bg-green-400 p-2 text-xs font-semibold uppercase text-white lg:text-base">
            Phim này đã hoàn tất
          </p>
        ) : (
          <p className=" mx-auto -mt-8 w-max rounded-md bg-green-400 p-2 text-xs font-semibold uppercase text-white lg:text-base">
            Phim này chưa hoàn tất
          </p>
        )}
        {/* <div
          className="fb-like mt-2"
          data-href={window.location.href}
          data-width=""
          data-layout=""
          data-action=""
          data-size=""
          data-share="true"
        /> */}
        <div className="film-info mt-4">
          <p className="head-title text-2xl font-medium capitalize">
            Đang xem phim {item?.title} -
            {currentEp?.link
              ? currentEp?.title?.trim().toLowerCase().startsWith("tập")
                ? currentEp?.title
                : ` Tập ${currentEp?.title}`
              : currentEp.link === null
                ? currentEp?.title?.trim().toLowerCase().startsWith("tập")
                  ? `${currentEp?.title} (Lỗi)`
                  : `Tập ${currentEp?.title} (Lỗi)`
                : " Tập Trailer"}
          </p>
          {item?.secondary_title && (
            <p className="original-title text italic">
              ({item?.secondary_title})
            </p>
          )}
          {skipAds && (
            <div className="mt-2 border-t border-t-overlay">
              <Tabs items={itemsTab} />
            </div>
          )}
          <div className="description-data mt-2 border-t border-t-blueSecondary py-2">
            <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
              <span className="border-b border-b-brandLinear pb-1 text-xl font-semibold">
                Giới thiệu phim
              </span>
              <div className="share flex items-center gap-2">
                <span className="share-text">Chia sẻ: </span>
                <div className="group-btn-share flex items-center gap-2">
                  <FacebookShareButton
                    url={document.URL}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#5142FC] transition-all duration-300 hover:!bg-white hover:!text-[#5142FC]"
                  >
                    <FaFacebook size={20} />
                  </FacebookShareButton>
                  <TwitterShareButton
                    url={document.URL}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#5142FC] transition-all duration-300 hover:!bg-white hover:!text-[#5142FC]"
                  >
                    <FaTwitter size={20} />
                  </TwitterShareButton>
                  <VKShareButton
                    url={document.URL}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#5142FC] transition-all duration-300 hover:!bg-white hover:!text-[#5142FC]"
                  >
                    <FaVk size={20} />
                  </VKShareButton>
                  <OKShareButton
                    url={document.URL}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#5142FC] transition-all duration-300 hover:!bg-white hover:!text-[#5142FC]"
                  >
                    <FaOdnoklassniki size={20} />
                  </OKShareButton>
                </div>
              </div>
            </div>
            <p className="description-text mt-2 text-sm font-normal leading-6">
              <span dangerouslySetInnerHTML={{ __html: item?.description }} />
            </p>
          </div>
        </div>
        {/* <CommentComponent slug={item?.slug} firstDataComment={item?.comments} /> */}
        {/* <div className="list-film-container">
        <ListFilmSameGenre listCategory={item?.category} title={item.title} />
      </div> */}
      </section>
      <div className="light-out" id="light-out"></div>
      <div className="comment-container relative overflow-x-hidden border-t border-t-blueSecondary">
        <p className="py-3 text-base font-bold uppercase text-white">
          Bình luận
        </p>
        <div
          className="fb-comments rounded-xl bg-white"
          data-href={window.location.href}
          data-width="100%"
          data-numposts="5"
          data-colorscheme="dark"
        />
      </div>
    </React.Fragment>
  );
}
