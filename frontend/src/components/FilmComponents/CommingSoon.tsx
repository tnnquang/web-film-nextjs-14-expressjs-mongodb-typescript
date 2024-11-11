import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { IoIosStar } from "react-icons/io";

import { IFilm } from "@/configs/types";
import Spinner from "../LoadingComponents/Spinner";
import { returnDefaultImageURL_v2, toStar } from "@/common/utils";
import { BASE_URL_API, GET_FILM_BY_FILTER, GET_FILM_COMMING_SOON, fetchOrigin } from "@/common/constant";

export default async function CommingSoonComponent() {
  const res = await fetch(`${BASE_URL_API}${GET_FILM_COMMING_SOON}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...fetchOrigin,},

    next: { revalidate: 900, tags: ["comming-soon"] },
  }).then((e) => e.json());
  const dataFilm = res.result;

  return (
    <Suspense>
      <div className="comming-soon-container grid grid-cols-2 gap-2 sm:grid-cols-3 2sm:grid-cols-4 2lg:block ">
        {dataFilm === null ? (
          <Spinner />
        ) : dataFilm.length === 0 ? null : ( // <p className="">Không có dữ liệu</p>
          dataFilm.map(async (film: IFilm) => {
            const imgSrc = returnDefaultImageURL_v2(film.thumbnail);
            return (
              <Link
                className="relative flex w-full cursor-pointer flex-col items-start gap-2 border-b-[#5142FC] py-2 transition duration-300 hover:text-blueSecondary md:gap-2 2lg:flex-row 2lg:border-b 2lg:first:pt-0"
                key={`b${film.slug}`}
                href={`/phim/${film.slug}`}
                prefetch={false}
              >
                <span className="relative block h-[252px] w-full max-w-[280px] overflow-hidden rounded-md border border-blue-200 2lg:h-[87px] 2lg:max-w-[75px] 2lg:rounded-md">
                  <Image
                    src={imgSrc}
                    fill
                    sizes="100vw"
                    alt={film.title as string}
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={"/bg-match-item.png"}
                    loading="lazy"
                    quality={50}
                  />
                </span>
                <div className="info-data">
                  <p className="title mb-0.5 md:mb-2 text-sm capitalize">{film.title}</p>
                  <p className="year text-xs opacity-80">{film.year_release}</p>
                  <p className="rates 2lg: absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-1 rounded-bl-md rounded-br-md bg-blueSecondary bg-opacity-80 px-3 py-1.5 text-xs text-white 2lg:left-auto 2lg:top-auto 2lg:translate-x-0 2lg:bg-transparent 2lg:p-0">
                    {toStar(film.rate)} <IoIosStar size={16} color="orange" />
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Suspense>
  );
}

export async function CommingSoonComponent_v2() {
  const res = await fetch(`${BASE_URL_API}${GET_FILM_BY_FILTER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...fetchOrigin,},
    body: JSON.stringify({
      filters: { quality: "Trailer", category: { $nin: ["Phim 18+"] } },
      limit: 10,
    }),
    next: { revalidate: 900, tags: ["comming-soon"] },
  }).then((e) => e.json());
  const dataFilm = res.result;

  return (
    <div className="comming-soon-container grid grid-cols-2 gap-2 sm:grid-cols-3 2sm:grid-cols-4 2lg:block ">
      {dataFilm === null ? (
        <Spinner />
      ) : dataFilm.length === 0 ? null : ( // <p className="">Không có dữ liệu</p>
        dataFilm.map((film: IFilm) => (
          <Link
            className="relative flex w-full cursor-pointer flex-col items-start gap-2 border-b-[#5142FC] py-2 transition duration-300 hover:text-blueSecondary md:gap-2 2lg:flex-row 2lg:border-b 2lg:first:pt-0"
            key={`b${film.slug}`}
            href={`/phim/${film.slug}`}
            prefetch={false}
          >
            <span className="relative block h-[252px] w-full max-w-[280px] overflow-hidden rounded-md border border-blue-200 2lg:h-[87px] 2lg:max-w-[75px] 2lg:rounded-md">
              {/* <ReturnImageCommingSoon item={film} /> */}
            </span>
            <div className="info-data">
              <p className="title mb-2 text-sm capitalize">{film.title}</p>
              <p className="year text-xs opacity-80">{film.year_release}</p>
              <p className="rates 2lg: absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-1 rounded-bl-md rounded-br-md bg-blueSecondary bg-opacity-80 px-3 py-1.5 text-xs text-white 2lg:left-auto 2lg:top-auto 2lg:translate-x-0 2lg:bg-transparent 2lg:p-0">
                {toStar(film.rate)} <IoIosStar size={16} color="orange" />
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
