import React from "react";
import Link from "next/link";

import { TAB_CATEGORY_FILM } from "@/common/enum";
import { BASE_URL_FRONTEND, fetchOrigin } from "@/common/constant";

import ListFilmItemComponent from "./ListFilmItem";

const arr = [
  {
    label: TAB_CATEGORY_FILM.SERIES_NEW,
    value: "phim-bo",
  },
  {
    label: TAB_CATEGORY_FILM.SINGLE_NEW,
    value: "phim-le",
  },
];

export default async function TabCategoryFilmComponent({
  tab,
}: {
  tab: string | null | undefined;
}) {
  const checked = arr.find((e) => e.value.toLowerCase() === tab?.toLowerCase());
  const tabSelected = checked || arr[0];

  async function fetchDataListNewFilms(): Promise<any[]> {
    const res = await fetch(
      `${BASE_URL_FRONTEND}/api/tab-phim?query=${tabSelected.label === TAB_CATEGORY_FILM.SERIES_NEW ? "phim-bo" : "phim-le"}`,
      {
        headers: { ...fetchOrigin },
        next: { revalidate: 15 * 60 }, //15 phút xác thực lại dữ liệu
      }
    );
    if (res.ok) {
      const tmp = await res.json();
      return tmp.data.result;
    } else {
      return [];
    }
  }

  const dataFilm = await fetchDataListNewFilms();

  return (
    <div className="list-film-tab-category w-full">
      <div className="flex w-full items-end gap-4">
        {arr.map((e) => (
          <Link
            className={`inline-block border-b-2 pb-2 ${
              tabSelected.value.toLowerCase() === e.value.toLowerCase()
                ? "border-b-[#5142FC] text-2xl font-bold uppercase text-[#5142FC] text-opacity-55"
                : "border-b-[#5142fc7f] font-semibold text-white"
            }`}
            key={e.value + "kk"}
            role="button"
            tabIndex={1}
            href={`?tab=${e.value}`}
          >
            {e.label}
          </Link>
        ))}
      </div>
      <div className="list-film-container mb-10 mt-3 flex flex-wrap items-start gap-2 lg:mt-6">
        <ListFilmItemComponent listFilm={dataFilm} />
      </div>
    </div>
  );
}
