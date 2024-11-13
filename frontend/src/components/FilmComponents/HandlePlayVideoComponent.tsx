"use client";

import { Tabs } from "antd";
import { isEmpty } from "lodash";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
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

import {
  BASE_URL_API,
  UPDATE_VIEW,
  fetchOrigin,
  isBrowser,
} from "@/common/constant";

import {
  checkCurrentEpisode,
  getElement,
  scrollToTop,
  toCapitalize,
} from "@/common/utils";
import { MdLightMode } from "react-icons/md";
import Link from "next/link";
import IframePlayerComponent from "../Players/EmbedPlayer";
import HLSPlayerComponent from "../Players/HLSPlayer";

const AdsPlayerComponent = dynamic(
  async () => await import("../Players/AdsPlayerComponent"),
  { ssr: false }
);

// const HLSPlayerComponent = dynamic(
//   async () => await import("../Players/HLSPlayer"),
//   { ssr: true }
// );
// const IframePlayerComponent = dynamic(
//   async () => await import("../Players/EmbedPlayer"),
//   { ssr: true }
// );

export default function HandlePlayVideoComponent({
  item,
  adsInPlayer,
  slug,
}: {
  item: any;
  adsInPlayer?: any;
  slug: string[];
}) {
  const router = useRouter();
  const pathName = usePathname();

  const [currentEp, setCurrentEp] = useState<any>(null);
  const [itemsTab, setItemsTab] = useState<any[]>([]);
  const [skipAds, setSkipAds] = useState(false);

  const epSlug = pathName.split("/").pop();

  const getCurrentTab = (item: IFilm) => {
    if (isEmpty(item) || isEmpty(item.list_episode)) return [];

    return item.list_episode!.map((el: any, index: number) => ({
      key: index.toString() + "oli",
      label: <p className="text-base font-medium text-white">{el.name}</p>,
      children: (
        <div className="list-link-grid grid max-h-[400px] grid-cols-3 items-center justify-start gap-1.5 overflow-y-auto px-1.5 lg:grid-cols-5 xl:grid-cols-7">
          {el.list_link.map((value: any, index: number) => (
            <Link
              href={`/xem-phim/${slug[0]}/${value.slug}`}
              key={`a${index}`}
              prefetch={true}
              // onClick={() => {
              //   setCurrentEp(value);
              //   // scrollToTop(0);
              //   // router.push(`/xem-phim/${slug[0]}/${value.slug}`);
              // }}
              className={`btn-ep inline-block w-full rounded-xl transition-all duration-300 hover:opacity-80 ${
                epSlug == value?.slug
                  ? "bg-blueSecondary text-white"
                  : "bg-white text-blueSecondary"
              } border border-blueSecondary p-1.5 text-center`}
              type="button"
            >
              {value.title?.trim().toLowerCase().startsWith("tập")
                ? toCapitalize(value.title)
                : `Tập ${value.title}`}
            </Link>
          ))}
        </div>
      ),
    }));
  };

  useEffect(() => {
    if (!item) return;
    if (
      !isEmpty(item.list_episode) &&
      !isEmpty(item.list_episode[0]?.list_link[0].link)
    ) {
      // const length = item.list_episode.length - 1;
      const ep = checkCurrentEpisode(slug, item);
      if (ep) {
        if (ep === "trailer") {
          setCurrentEp(null);
        } else {
          setCurrentEp(ep);
        }
      } else {
        setCurrentEp(item.list_episode[0].list_link[0]);
      }
      // setCurrentEp(
      //   ep ? (ep === "trailer" ? null : ep) : item.list_episode[0].list_link[0]
      // );
    } else {
      setCurrentEp(null);

      router.push(`/xem-phim/${slug[0]}/tap-trailer`);
    }
    setItemsTab(getCurrentTab(item));
  }, [item]);

  useEffect(() => {
    if (!currentEp) {
      // router.prefetch(`/xem-phim/${slug[0]}/tap-trailer`);
      // router.push(`/xem-phim/${slug[0]}/tap-trailer`);
      return;
      // if (
      //   isEmpty(item?.list_episode[0]?.list_link[0].link) ||
      //   (item?.trailer_url && item.quality == "Trailer")
      // ) {
      //   router.prefetch(`/xem-phim/${slug[0]}/tap-trailer`);
      //   router.push(`/xem-phim/${slug[0]}/tap-trailer`);
      // }
    }
    // router.prefetch(`/xem-phim/${slug[0]}/${currentEp.slug}`);
    router.push(`/xem-phim/${slug[0]}/${currentEp.slug}`);
  }, [currentEp]);

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
    if (isEmpty(adsInPlayer?.ads_content)) {
      setSkipAds(true);
    }
  }, [adsInPlayer]);

  if (!item)
    return (
      <div className="relative mb-2 mt-8 flex h-[400px] w-full max-w-full animate-pulse items-center justify-center rounded-xl bg-brandLinear bg-opacity-20 xl:h-[500px] 2xl:h-[550px]">
        <FaCirclePlay size={44} />
      </div>
    );

  const VideoShow = () => {
    // Kiểm tra điều kiện hiển thị video ads
    if (!skipAds && !isEmpty(adsInPlayer?.ads_content)) {
      return (
        <div className="h-[320px] max-h-[500px] w-full sm:h-[45vw]">
          <AdsPlayerComponent
            adsContent={adsInPlayer?.ads_content[1]?.content}
            setSkipAds={setSkipAds}
          />
        </div>
      );
    }

    // Kiểm tra điều kiện hiển thị video chính
    if (currentEp) {
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
      } else {
        // Hiển thị thông báo "Phim đang được cập nhật"
        return (
          <p className="flex h-[350px] items-center justify-center text-center text-base font-bold text-white">
            Phim đang được cập nhật
          </p>
        );
      }
    }

    // Kiểm tra xem trailer_url có hợp lệ hay không
    if (item.trailer_url) {
      return (
        <div className="h-[320px] max-h-[500px] w-full sm:h-[45vw]">
          <ReactPlayer
            url={item.trailer_url}
            width="100%"
            height="100%"
            controls
            playing
          />
        </div>
      );
    }

    // Hiển thị biểu tượng khi không có tập hiện tại và không có trailer
    return (
      <div className="no-current-ep relative mb-2 mt-8 flex h-[400px] w-full max-w-full items-center justify-center rounded-xl bg-opacity-20 text-base font-semibold md:text-lg xl:h-[500px] 2xl:h-[550px]">
        Không có dữ liệu phim mà bạn yêu cầu
      </div>
    );
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

  return (
    <React.Fragment>
      <section className="watch-film-container relative mt-8 w-full">
        <div
          className={`video-player-container relative ${!currentEp?.link && !item?.trailer_url ? "flex items-center justify-center" : ""} w-full !overflow-hidden rounded-xl border border-blueSecondary bg-opacity-50`}
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
            {/* {currentEp?.link
              ? currentEp?.title?.trim().toLowerCase().startsWith("tập")
                ? currentEp?.title
                : ` Tập ${currentEp?.title}`
              : !currentEp?.link
                ? currentEp?.title?.trim().toLowerCase().startsWith("tập")
                  ? `${currentEp?.title} (Lỗi)`
                  : `Tập ${currentEp?.title} (Lỗi)`
                : " Tập Trailer"} */}
            {pathName.split("/").pop() === "tap-trailer"
              ? "Trailer"
              : currentEp?.title?.trim().toLowerCase().startsWith("tập")
                ? currentEp?.title
                : ` Tập ${currentEp?.title}`}
          </p>
          {item?.secondary_title && (
            <p className="original-title text italic">
              ({item?.secondary_title})
            </p>
          )}
          {skipAds &&
            pathName.split("/").pop() !== "tap-trailer" &&
            !isEmpty(currentEp?.link) && (
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
                <span className="share-text">Sharing: </span>
                <div className="group-btn-share flex items-center gap-2">
                  <FacebookShareButton
                    url={document.URL}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#4660e6] transition-all duration-300 hover:!bg-white hover:!text-[#4660e6]"
                  >
                    <FaFacebook size={20} />
                  </FacebookShareButton>
                  <TwitterShareButton
                    url={document.URL}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#4660e6] transition-all duration-300 hover:!bg-white hover:!text-[#4660e6]"
                  >
                    <FaTwitter size={20} />
                  </TwitterShareButton>
                  <VKShareButton
                    url={document.URL}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#4660e6] transition-all duration-300 hover:!bg-white hover:!text-[#4660e6]"
                  >
                    <FaVk size={20} />
                  </VKShareButton>
                  <OKShareButton
                    url={document.URL}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full !bg-[#4660e6] transition-all duration-300 hover:!bg-white hover:!text-[#4660e6]"
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
