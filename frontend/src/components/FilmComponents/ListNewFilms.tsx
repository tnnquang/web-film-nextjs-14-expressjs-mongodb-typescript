import Link from "next/link";
import { isEmpty } from "lodash";
// import dynamic from "next/dynamic";
import { FaCaretRight } from "react-icons/fa6";

import { getListFilm } from "@/common/utils";
import ListFilmItemComponent from "./ListFilmItem";
import { BASE_URL_API } from "@/common/constant";

// const ListFilmItemComponent = dynamic(()=> import("./ListFilmItem"))

export default async function ListNewFilms() {
  const listFilm = await getListFilm(`${BASE_URL_API}/film/film-filter`, {
    filters: {
      category: ["Tình Cảm"],
      quality: { $ne: "Trailer" },
      country: "Hàn Quốc",
    },
    limit: 12,
  });

  return !isEmpty(listFilm) ? (
    <div className=" list-cartoon-container">
      <div className="flex items-center justify-between gap-2 rounded-lg bg-blueSecondary bg-opacity-30 p-2">
        <Link
          className="big-title inline-block w-fit border-b-2 border-b-[#5142fc7f] text-base font-semibold text-white sm:text-xl"
          prefetch={false}
          href="/the-loai/tinh-cam-dDiip"
          target="_blank"
        >
          Phim Tình Cảm
        </Link>
        <Link
          className="flex items-center gap-1 rounded-sm bg-white px-1 py-0.5 text-xs font-semibold text-blueSecondary transition-all duration-300 hover:bg-opacity-60"
          prefetch={false}
          href="/the-loai/tinh-cam-dDiip"
          target="_blank"
        >
          Xem thêm
          <FaCaretRight size={14} />
        </Link>
      </div>
      <div className="list-film-container mb-3 lg:mb-10 mt-6 flex w-full flex-wrap items-start gap-2">
        <ListFilmItemComponent listFilm={listFilm} />
      </div>
    </div>
  ) : null;
}
