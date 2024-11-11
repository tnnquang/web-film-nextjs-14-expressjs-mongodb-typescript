import Link from "next/link";
import Image from "next/image";
import { isEmpty } from "lodash";
import { FaPlay, FaUser } from "react-icons/fa";

import { calculateStatus, returnDefaultImageURL_v2 } from "@/common/utils";
import ListFilmSameGenre from "@/components/FilmComponents/ListFilmSameGenre";
import {
  BASE_URL_API,
  GET_FILM_FROM_SLUG,
  GET_ONE_CATEGORY,
  GET_ONE_COUNTRY,
  fetchOrigin,
} from "@/common/constant";
import { revalidatePath } from "next/cache";
import React from "react";

export default async function Film({ params }: { params: any }) {
  const slug = params.slug;

  const dataSlug = await fetch(`${BASE_URL_API}${GET_FILM_FROM_SLUG}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...fetchOrigin,
    },
    body: JSON.stringify({
      slug: slug,
      type: "short",
    }),
    next: { revalidate: 1800 },
  });
  if (dataSlug.ok) {
    const data = await dataSlug.json();
    const item = data.item;

    //Get image
    const image = returnDefaultImageURL_v2(item.thumbnail);
    // console.log("itemeeee", item)
    const promiseCategories = item.categories.map(async (e: string) => {
      const cate = await fetch(`${BASE_URL_API}${GET_ONE_CATEGORY}?slug=${e}`, {
        headers: {
          ...fetchOrigin,
        },
      }).then((value) => value.json());
      return cate;
    });
    const categories = await Promise.all(promiseCategories);
    // console.log(categories)
    const categorySlug = (cateName: string) =>
      categories.find((e) => e?.result?.name === cateName)?.result?.slug;

    // console.log("country >> ", item.country, item.countries)
    const promiseCountries = (item?.countries as [])?.map(async (e: string) => {
      const country = await fetch(
        `${BASE_URL_API}${GET_ONE_COUNTRY}?slug=${e}`,
        {
          headers: {
            ...fetchOrigin,
          },
        }
      ).then((value) => value.json());
      return country;
    });
    const countries = await Promise.all(promiseCountries);
    // console.log("countries >> ", countries);
    const countrySlug = (countryName: string) =>
      countries?.find((e) => e?.result?.name === countryName)?.result?.slug;

    const RenderButtonWatch = () => {
      if (isEmpty(item)) return null;
      // console.log("iteeeeem", item)
      if (item.quality === "Trailer") {
        if (item.current_episode > 0) {
          return (
            <Link
              className={`watch-film mx-auto flex items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 transition-all duration-200 hover:opacity-80`}
              type="button"
              role="button"
              tabIndex={1}
              href={`/xem-phim/${item?.slug}/${item.first_episode.slug}`}
              prefetch={false}
            >
              <FaPlay /> Xem Phim
            </Link>
          );
        }
        if (!isEmpty(item.trailer_url)) {
          return (
            <Link
              className={`watch-film mx-auto mt-2 flex items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 transition-all duration-200 hover:opacity-80 `}
              type="button"
              role="button"
              tabIndex={1}
              href={`/xem-phim/${item?.slug}/tap-trailer`}
              prefetch={false}
            >
              <FaPlay /> Xem Trailer
            </Link>
          );
        } else {
          return (
            <span
              className={`watch-film mx-auto mt-2 flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 opacity-25 transition-all duration-200`}
            >
              <FaPlay /> Xem Phim
            </span>
          );
        }
      } else {
        if (item.current_episode == 0) {
          if (!isEmpty(item?.trailer_url)) {
            return (
              <Link
                className={`watch-film mx-auto mt-2 flex items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 transition-all duration-200 hover:opacity-80 `}
                type="button"
                role="button"
                tabIndex={1}
                href={`/xem-phim/${item?.slug}/tap-trailer`}
                prefetch={false}
              >
                <FaPlay /> Xem Trailer
              </Link>
            );
          } else {
            return (
              <span
                className={`watch-film mx-auto mt-2 flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 opacity-25 transition-all duration-200`}
              >
                <FaPlay /> Danh sách phim đã bị lỗi
              </span>
            );
          }
        } else {
          return (
            <Link
              className={`watch-film mx-auto flex items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 transition-all duration-200 hover:opacity-80`}
              type="button"
              role="button"
              tabIndex={1}
              href={`/xem-phim/${item?.slug}/${item.first_episode.slug}`}
              prefetch={false}
            >
              <FaPlay /> Xem Phim
            </Link>
          );
        }
      }
    };

    revalidatePath(`/phim/[slug]`, "page");

    return (
      <section className="film-container mx-auto mt-6 w-full max-w-[1800px] items-start ">
        <div className="wrapper-content flex flex-col items-start gap-8 md:flex-row">
          <div className="left-content mx-auto w-[300px] md:w-[230px]">
            <div className="film-thumbnail relative mx-auto mb-2 h-[350px] w-full overflow-hidden rounded-lg shadow-md shadow-horizonPurple-400 sm:w-[230px]">
              <Image
                src={image}
                fill
                alt={item?.title}
                placeholder="blur"
                blurDataURL="/blur_img.webp"
                className="rounded-lg object-cover"
                sizes="100vw"
                loading="lazy"
                quality={60}
              />
            </div>
            {/* {item.quality === "Trailer" ? (
              !isEmpty(item.trailer_url) ? (
                <Link
                  className={`watch-film mx-auto mt-2 flex items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 transition-all duration-200 hover:opacity-80 `}
                  type="button"
                  role="button"
                  tabIndex={1}
                  href={`/xem-phim/${item?.slug}`}
                  prefetch={false}
                >
                  <FaPlay /> Xem Trailer
                </Link>
              ) : (
                <span
                  className={`watch-film mx-auto mt-2 flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 opacity-25 transition-all duration-200`}
                >
                  <FaPlay /> Xem Phim
                </span>
              )
            ) : (
              <Link
                className={`watch-film mx-auto flex items-center justify-center gap-2 rounded-lg bg-danger px-3 py-2 transition-all duration-200 hover:opacity-80`}
                type="button"
                role="button"
                tabIndex={1}
                href={`/xem-phim/${item?.slug}`}
                prefetch={false}
              >
                <FaPlay /> Xem Phim
              </Link>
            )} */}
            <RenderButtonWatch />
          </div>
          <div className="right-content w-full">
            <div className="group-title mb-6">
              <p className="title-text text-xl font-semibold text-white">
                {item?.title}
              </p>
              {item?.secondary_title && (
                <p className="mt-2 text-sm italic">{item?.secondary_title}</p>
              )}
            </div>
            <div className="content-info w-full max-w-full rounded-lg p-4 shadow-[#14141F]">
              <p className="flex items-center gap-4 py-2 text-sm">
                <span className="status-text w-full max-w-[100px] font-semibold opacity-70">
                  Trạng thái
                </span>
                <span className="text detail-text">
                  {item.quality === "Trailer"
                    ? item.current_episode >= 1
                      ? "HD"
                      : "Trailer"
                    : calculateStatus(
                        item?.current_episode,
                        item?.total_episode
                      ).trim()}
                </span>
              </p>
              {item?.duration && (
                <p className="duration flex items-center gap-4 py-2 text-sm">
                  <span className="duration-text  w-[100px] font-semibold opacity-70">
                    Thời lượng
                  </span>
                  <span className="text detail-text">
                    {(item?.duration as string)?.startsWith("undefined")
                      ? "Không xác định"
                      : item?.duration}
                  </span>
                </p>
              )}
              {+item?.total_episode >= 1 && (
                <p className="total-ep flex items-center gap-4 py-2 text-sm">
                  <span className="duration-text  w-[100px] font-semibold opacity-70">
                    Số tập
                  </span>
                  <span className="text detail-text">
                    {item?.total_episode} tập
                  </span>
                </p>
              )}
              <p className="duration flex items-start gap-4 py-2 text-sm">
                <span className="duration-text w-[100px] font-semibold opacity-70">
                  Thể loại
                </span>
                <span className="text detail-text">
                  {item?.categories &&
                    typeof item?.categories[0] !== "object" &&
                    item?.categories?.map((e: string, index: number) => (
                      <Link
                        href={`/the-loai/${categorySlug(e)}`}
                        key={e}
                        target="_blank"
                        prefetch={false}
                        className="transition-all duration-200 hover:opacity-55"
                      >
                        {index > 0 && ", "} {e}
                      </Link>
                    ))}
                </span>
              </p>
              {item.quality !== "Trailer" && (
                <p className="duration flex items-center gap-4 py-2 text-sm">
                  <span className="duration-text  w-[100px] font-semibold opacity-70">
                    Chất lượng
                  </span>
                  <span className="text detail-text">{item?.quality}</span>
                </p>
              )}
              <p className="duration flex items-start gap-4 py-2 text-sm">
                <span className="duration-text w-[100px] font-semibold opacity-70">
                  Quốc gia
                </span>
                <span className="text detail-text">
                  {(item?.countries as [])?.map((e: string, index: number) => (
                    <React.Fragment key={e + "cc"}>
                      {index > 0 && ", "}
                      <Link
                        href={`/quoc-gia/${countrySlug(e)}`}
                        target="_blank"
                        prefetch={false}
                        className="transition-all duration-200 hover:opacity-55"
                      >
                        {e}
                      </Link>
                    </React.Fragment>
                  ))}
                </span>
              </p>
              {!isEmpty(item?.language) && !isEmpty(item?.language[0]) && (
                <p className="duration flex items-center gap-4 py-2 text-sm">
                  <span className="duration-text  w-[100px] font-semibold opacity-70">
                    Ngôn ngữ
                  </span>
                  <span className="text detail-text">
                    {item?.language.join(", ")}
                  </span>
                </p>
              )}
              <p className="duration flex items-center gap-4 py-2 text-sm">
                <span className="duration-text  w-[100px] font-semibold opacity-70">
                  Năm sản xuất/ra mắt
                </span>
                <span className="text detail-text">{item?.year_release}</span>
              </p>
              {!isEmpty(item?.director) && !isEmpty(item?.director[0]) && (
                <p className="duration flex items-start gap-4 py-2 text-sm">
                  <span className="duration-text w-[100px] font-semibold opacity-70">
                    Đạo diễn
                  </span>
                  <span className="text detail-text">
                    {item?.director?.map((e: string, index: number) => (
                      <React.Fragment key={e + "dd"}>
                        {index > 0 && ", "}
                        <Link
                          href={`/danh-sach/${e}&type=director`}
                          // key={e + "dd"}
                          target="_blank"
                          prefetch={false}
                          className="transition-all duration-200 hover:opacity-55"
                        >
                          {e}
                        </Link>
                      </React.Fragment>
                    ))}
                  </span>
                </p>
              )}
              {!isEmpty(item?.performer) && !isEmpty(item?.performer[0]) && (
                <p className="duration flex items-start gap-4 py-2 text-sm">
                  <span className="duration-text  w-[100px] font-semibold opacity-70">
                    Diễn viên
                  </span>
                  <span className="text detail-text leading-8">
                    {item?.performer?.map((e: string, index: number) => (
                      <React.Fragment key={e + "tt"}>
                        {index > 0 && ", "}
                        <Link
                          href={`/danh-sach/${e}&type=performer`}
                          target="_blank"
                          prefetch={false}
                          className="transition-all duration-200 hover:opacity-55"
                        >
                          {e}
                        </Link>
                      </React.Fragment>
                    ))}
                  </span>
                </p>
              )}
              <p className="duration flex items-center gap-4 py-2 text-sm">
                <span className="duration-text  w-[100px] font-semibold opacity-70">
                  Lượt xem
                </span>
                <span className="text detail-text">{item?.views ?? 0}</span>
              </p>
            </div>
          </div>
        </div>
        {!isEmpty(item?.performer) && !isEmpty(item?.performer[0]) && (
          <div className="performer-list wrapper-content mt-6">
            <p className="title-text-perfomer mb-4 text-base font-bold">
              Diễn viên
            </p>
            <ul className="performers flex flex-wrap items-start gap-6">
              {item?.performer?.map((performer: string) => (
                <li
                  className="flex w-24 flex-col items-center justify-center text-center"
                  key={performer + "ppp"}
                >
                  <Link
                    href={`/danh-sach/${performer}&type=performer`}
                    target="_blank"
                    className="flex flex-col items-center transition-all duration-200 hover:opacity-80"
                    prefetch={false}
                  >
                    <span className="img-performer flex h-16 w-16 items-center justify-center rounded-full bg-blueSecondary">
                      <FaUser />
                    </span>
                    <p className="name-perfomer mt-2 w-24 truncate text-sm leading-5">
                      {performer}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="description my-4 p-2">
          <p className="mb-3 text-center text-base font-semibold uppercase">
            Nội dung phim
          </p>
          <p className="main-description text-sm opacity-80">
            <span
              dangerouslySetInnerHTML={{ __html: item?.description }}
            ></span>
          </p>
        </div>
        <ListFilmSameGenre
          listCategory={item?.categories}
          title={item?.title}
        />
        <div className="keywords">
          <span className="text-keywords text-base font-bold underline">
            Các từ khoá tìm kiếm/Keywords:{" "}
          </span>
          {item.keywords.map((el: string, index: number) => (
            <Link
              href={`/search?query=${el}`}
              key={el + index.toString() + "kk"}
              target="_blank"
              className="text-sm text-opacity-70 hover:text-red-500 hover:text-opacity-60"
            >
              {el}
              {index < item.keywords.length - 1 ? ", " : "."}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return null;
}
