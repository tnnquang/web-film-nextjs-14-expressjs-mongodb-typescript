import { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

import ErrorPhim from "./error";
import NotFoundComponent from "@/components/404";
import { BASE_URL_FRONTEND } from "@/common/constant";
import { SITE_CONFIG } from "@/configs/metadata-config";
import Spinner from "@/components/LoadingComponents/Spinner";
import {
  PERSONAL_TYPE,
  TYPE_LIST_FILM_SINGLE_OR_SERIES,
} from "@/configs/types";


type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export function generateMetadata({ params }: Props): Metadata {
  const slug = params.id;
  const arrSlug = decodeURIComponent(slug).split("&");
  if (arrSlug.length > 1) {
    const type = arrSlug[1].split("=");
    if (type[1] === "director") {
      return {
        title: `Danh sách phim của Đạo diễn ${arrSlug[0]}`,
        description: SITE_CONFIG.home,
      };
    }
    if (type[1] === "performer") {
      return {
        title: `Danh sách phim của Diễn viên ${arrSlug[0]}`,
        description: SITE_CONFIG.home,
      };
    }
  } else {
    if (TYPE_LIST_FILM_SINGLE_OR_SERIES.includes(slug)) {
      return {
        title:
          slug === "phim-le"
            ? SITE_CONFIG.phimle
            : slug === "phim-bo"
              ? SITE_CONFIG.phimbo
              : slug === "phim-chieu-rap"
                ? SITE_CONFIG.phimchieurap
                : SITE_CONFIG.phimmoicapnhat,
        description:
          slug === "phim-le"
            ? SITE_CONFIG.phimle
            : slug === "phim-bo"
              ? SITE_CONFIG.phimbo
              : slug === "phim-chieu-rap"
                ? SITE_CONFIG.phimchieurap
                : SITE_CONFIG.phimmoicapnhat,
        metadataBase: new URL(BASE_URL_FRONTEND),
      };
    }
  }

  return {
    title: "Không tìm thấy trang này",
    description: SITE_CONFIG.home,
  };
}

export default function ListLayout({ children, params }: Props) {
  let checked = false;
  const slug = params.id;
  let type = null;
  const arrSlug = decodeURIComponent(slug).split("&");
  //slug = "aaaaa", ""
  if (arrSlug.length === 1) {
    checked = TYPE_LIST_FILM_SINGLE_OR_SERIES.includes(slug);
  } else {
    type = arrSlug[1].split("=")[1];
    checked = PERSONAL_TYPE.includes(type.toLowerCase());
    // console.log("hehehee", type, checked)
  }
  if (checked)
    return (
      <Suspense
        fallback={
          <div className="loading-list mx-auto flex h-screen w-screen items-center justify-center p-0">
            <Spinner />
          </div>
        }
      >
        <div className="w-full">
          <p className="my-2 w-full text-xl font-bold">
            {type && PERSONAL_TYPE.includes(type.toLowerCase())
              ? `
            Danh sách phim của 
            ${type === "performer" ? "Diễn viên" : "Đạo diễn"}
          `
              : `Danh sách `}
            <span className="name-of rounded-xl bg-blueSecondary px-2 py-1 shadow-lg">
              {type && PERSONAL_TYPE.includes(type.toLowerCase())
                ? arrSlug[0]
                : slug === "phim-le"
                  ? "Phim Lẻ"
                  : slug === "phim-bo"
                    ? "Phim Bộ"
                    : slug === "phim-chieu-rap"
                      ? "Phim Chiếu Rạp"
                      : "Phim Mới Cập Nhật"}
            </span>
          </p>

          <ErrorBoundary errorComponent={ErrorPhim}>{children}</ErrorBoundary>
        </div>
      </Suspense>
    );
  return <NotFoundComponent />;
}
