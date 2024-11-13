"use client";

import Link from "next/link";
import Image from "next/image";
import { isEmpty } from "lodash";
import { GoStarFill } from "react-icons/go";
import AliceCarousel from "react-alice-carousel";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

import { IFilm } from "@/configs/types";
import { returnDefaultImageURL_v2, toStar, formatNumber } from "@/common/utils";

export default function ListHotFilmComponent({
  listFilm,
}: {
  listFilm: IFilm[] | [];
}) {
  if (isEmpty(listFilm) || listFilm?.length === 0) return null;

  const items = listFilm?.map(async (e: IFilm, index: number) => {
    const imgSrc = returnDefaultImageURL_v2(e.thumbnail);
    return (
      <Link
        href={`/phim/${e?.slug}`}
        prefetch={false}
        className="film-item-slider relative flex h-[180px] w-full gap-4 rounded-xl transition-all duration-300"
        style={{
          background: `#14141F url(${imgSrc}) 100% 100%`,
        }}
        key={e.slug}
      >
        <div className="custom-filter-blur absolute left-0 top-0 z-0 h-full w-full rounded-xl"></div>
        <div className="relative z-10 h-full w-2/5 overflow-hidden rounded-xl">
          {/* <ReturnImageHotFilm item={e} /> */}
          <Image
            src={imgSrc}
            fill
            sizes="100vw"
            loading="lazy"
            alt={e?.title as string}
            // placeholder="blur"
            // blurDataURL={"/blur_img.webp"}
          />
        </div>
        <div className=" relative z-10 w-3/5 pr-4">
          <div className="info-detail relative flex h-full w-full flex-col justify-center">
            <p className="title mb-6 line-clamp-2 text-base font-semibold">
              {e?.title}
            </p>
            <p className="country text-sm font-semibold">
              Quốc gia: <span className=" font-normal"></span>
              {e?.country?.join(", ")}
            </p>
            <p className="rate flex items-center gap-2 text-sm font-semibold">
              Đánh giá:{" "}
              <span className="flex items-center gap-1 font-normal">
                {toStar(e?.rate)}
                <GoStarFill size={20} color="orange" />
              </span>
            </p>
            <p className="views">Views: {formatNumber(e?.views as number)}</p>
            <p className="rank-item absolute bottom-0 right-0 text-6xl text-white text-opacity-90">
              {index + 1}
            </p>
          </div>
        </div>
      </Link>
    );
  });

  return (
    <AliceCarousel
      mouseTracking
      autoPlay
      autoPlayStrategy="all"
      autoPlayInterval={1500}
      animationType="slide"
      infinite={true}
      touchTracking={true}
      disableDotsControls
      renderNextButton={() => <FaChevronRight size={16} color="#fff" />}
      renderPrevButton={() => <FaChevronLeft size={16} color="#fff" />}
      items={items}
      responsive={{
        320: {
          items: 1,
        },
        576: {
          items: 1.5,
        },
        640: {
          items: 2,
        },
        768: {
          items: 2.5,
        },
        992: {
          items: 3,
        },
        1100: {
          items: 3.5,
        },
        1300: {
          items: 4,
        },
        1400: {
          items: 4.5,
        },
        1500: {
          items: 5.5,
        },
      }}
      ssrSilentMode
    />
  );
}
