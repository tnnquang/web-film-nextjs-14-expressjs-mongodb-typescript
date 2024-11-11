import Link from "next/link";
import Image from "next/image";

import { IFilm } from "@/configs/types";
import { calculateStatus, returnDefaultImageURL_v2 } from "@/common/utils";
// import { isEmpty } from "lodash";

interface CustomFilm extends IFilm {
  current_episode: number | string;
}

export function FilmSkeletonComponent() {
  return (
    <div className="data-list-film flex w-full flex-wrap items-start gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((e) => (
        <div
          className="film-item item-film-skeleton animate-pulse bg-brandLinear"
          key={`a${e}`}
        />
      ))}
    </div>
  );
}

export default function ListFilmItemComponent({
  listFilm,
}: {
  listFilm: any[];
}) {
  if (listFilm === null) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) => (
      <div
        className="film-item item-film-skeleton animate-pulse bg-brandLinear"
        key={`a${e}`}
      />
    ));
  }
  if (listFilm?.length === 0) {
    return <div className="w-full pt-5 text-center">Không có dữ liệu</div>;
  }

  const RenderQuality = ({ f }: { f: CustomFilm }) => {
    if (f.quality === "Trailer" && +f.current_episode! >= 1) {
      return (
        <>
          <span className="quality-text absolute left-0 top-0 z-10 min-w-[72px] rounded bg-danger p-1 text-center text-xs">
            Full HD
          </span>
          ;
          <span className="status-text absolute left-0 top-[26px] min-w-[72px] rounded-br rounded-tr bg-blueSecondary p-1 text-center text-xs text-white">
            {calculateStatus(f.current_episode, f.total_episode)}
          </span>
        </>
      );
    }
    if (f.quality !== "Trailer") {
      return (
        <>
          <span className="quality-text absolute left-0 top-0 z-10 min-w-[72px] rounded bg-danger p-1 text-center text-xs">
            {f.quality}
          </span>

          <span className="status-text absolute left-0 top-[26px] min-w-[72px] rounded-br rounded-tr bg-blueSecondary p-1 text-center text-xs text-white">
            {calculateStatus(f.current_episode || 0, f.total_episode || 0)}
          </span>
        </>
      );
    }
    return (
      <span className="quality-text absolute left-0 top-0 z-10 min-w-[72px] rounded bg-danger p-1 text-center text-xs">
        {f.quality}
      </span>
    );
  };

  return listFilm?.map(async (e: CustomFilm, index: number) => {
    const imgSrc = returnDefaultImageURL_v2(e.thumbnail);
    return (
      <Link
        className="film-item relative overflow-hidden p-2"
        key={index.toString() + e.slug + "lpj"}
        href={`/phim/${e.slug}`}
        prefetch={false}
      >
        {/* <div className="overlay-play invisible absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center rounded-xl bg-overlay transition-all duration-300 hover:visible">
        <CiPlay1 size={32} />
      </div> */}
        {/* <ReturnImage item={e} /> */}
        <Image
          src={imgSrc}
          fill
          alt={e.title ?? ""}
          loading="lazy"
          placeholder="blur"
          blurDataURL={"/bg-match-item.png"}
          className="object-cover transition-all duration-300 hover:scale-105"
          sizes="100vw"
          quality={40}
        />

        {/* <span className="quality-text absolute left-0 top-0 z-10 min-w-[72px] rounded bg-danger p-1 text-center text-xs">
          {e.quality}
        </span>
        {e.quality !== "Trailer" && isEmpty(e.list_episode) && (
          <span className="status-text absolute left-0 top-[26px] min-w-[72px] rounded-br rounded-tr bg-blueSecondary p-1 text-center text-xs text-white">
            {calculateStatus(e.current_episode, e.total_episode)}
          </span>
        )} */}
        <RenderQuality f={e} />
        {e.outstanding && (
          <span className="outstanding-text absolute right-0 top-0 z-10 ml-3 line-clamp-2 w-full max-w-[80px] rounded bg-purple-600 p-1 text-center text-[10px] text-white">
            {e.outstanding}
          </span>
        )}

        <p className="watch-full-text absolute bottom-0 left-0 text-xl font-bold text-danger">
          Xem phim
        </p>
        <div className="title-film absolute bottom-0 left-0 z-50 w-full text-center text-sm ">
          <p className="title line-clamp-2">{e.title}</p>
          {e.secondary_title && (
            <p className="original-title line-clamp-2 italic text-[#ffab10]">
              ({e.secondary_title})
            </p>
          )}
        </div>
      </Link>
    );
  });
}
