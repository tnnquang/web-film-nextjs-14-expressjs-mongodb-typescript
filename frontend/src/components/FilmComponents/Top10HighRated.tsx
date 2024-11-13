import Link from "next/link";
import Image from "next/image";
import { IoIosStar } from "react-icons/io";

import Spinner from "../LoadingComponents/Spinner";
import { IFilm } from "@/configs/types";
import { fetchDataHighRate, toStar } from "@/common/utils";
import { isEmpty } from "lodash";

export default async function Top10HighRatedComponent() {
  const dataFilm = await fetchDataHighRate();
  // console.log("kekekee", dataFilm)
  return (
    <div className="high-rate-container grid grid-cols-2 gap-2 sm:grid-cols-3 2lg:block ">
      {dataFilm.result === null ? (
        <Spinner />
      ) : dataFilm.result.length === 0 ? (
        <p className="">Không có dữ liệu</p>
      ) : (
        dataFilm.result.map((e: IFilm) => (
          <Link
            className="relative flex w-full cursor-pointer flex-col items-start gap-2 border-b-[#4660e6] py-2 transition duration-300 first:pt-0 hover:text-blueSecondary md:gap-4 2lg:flex-row 2lg:border-b"
            key={`b${e.slug}`}
            href={`/phim/${e.slug}`}
            prefetch={false}
          >
            <span className="relative block h-[280px] w-full max-w-[280px] border border-blue-200 2lg:h-[87px] 2lg:max-w-[75px]">
              <Image
                src={
                  isEmpty(e?.thumbnail) ? "/blur_img.webp" : `/${e.thumbnail}`
                }
                fill
                sizes="100vw"
                alt={e.title as string}
                className="object-cover"
                // placeholder="blur"
                // blurDataURL={"/blur_img.webp"}
                loading="lazy"
                quality={50}
              />
            </span>
            <div className="info-data">
              <p className="title mb-2 text-sm capitalize">{e.title}</p>
              <p className="year text-xs opacity-80">{e.year_release}</p>
              <p className="rates flex items-center gap-1 text-xs">
                {toStar(e.rate)} <IoIosStar size={16} color={"orange"} />
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
