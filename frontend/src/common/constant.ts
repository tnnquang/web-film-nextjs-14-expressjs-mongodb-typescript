import configURI from "@/configs/configURI.json";

export const PROD = process.env.NODE_ENV === "production";
export const isBrowser = typeof window !== "undefined";
export const BASE_URL_API = PROD
  ? configURI.api.production
  : configURI.api.devlopment;

export const BASE_URL_FRONTEND = PROD
  ? configURI.frontend.production
  : configURI.frontend.devlopment;

export const BASE_URL_ADS = PROD
  ? configURI.ads.production
  : configURI.ads.devlopment;

export const IMAGE_BASE_URL = PROD
  ? configURI.image.production
  : configURI.image.devlopment;

export const BASE_URL_FRONTEND_NO_PROTOCOL = configURI.baseUrlNoProtocol;
export const acceptImage =
  "image/png,image/jpeg,image/webp,image/tiff,image/avif";
export const acceptVideo = "video/mp4,video/mkv";
export const VIDEO_API_KEY = "123774v9eris7ejjr68vkb";
export const DEFAULT_HEIGHT_INPUT = "40px";
export const TOTAL_STAR = 10;
export const DEFAULT_ITEMS = 20;

export const KEYWORDS = [
  "phim hay",
  "phim vietsub",
  "phim hd",
  "phim lồng tiếng",
  "phim trung quốc",
  "phim việt nam",
  "phim hay hd",
  "phim cập nhật nhanh",
  "tv show",
  "chương trình",
  "phim tình cảm",
  "phim kiếm hiệp",
  "phim đam mỹ",
  "phim boy love",
  "yu thánh thiện",
  "phim hàn quốc",
  "tình cảm hàn quốc",
  "phim hoạt hình",
  "phim kiếm hiệp",
  "phim kinh dị",
  "phim ma",
  "tâm lý tình cảm",
  "khoa học viễn tưởng",
  "khoa hoc vien tuong",
  "hd phim hay",
  "phim cập nhật nhanh",
  "thần tiên",
  "hoạt hình",
  "âu mỹ",
  "ác quỷ ma sơ",
  "indisious",
  "phim hành động",
  "châu tinh trì",
  "cảnh sát",
  "phim 18+",
  "18+",
  "phim thần thoại",
];

/* API ENDPOINT */

export const GET_DATA_FROM_LIST_CATEGORY = "/film/film-of-list-category";
export const GET_FILM_FROM_SLUG = "/film/film-by-slug";
export const GET_FILM_BY_FILTER = "/film/film-filter";
export const GET_FILM_COMMING_SOON = "/film/comming-soon";
export const GET_HIGH_RATE = "/film/high-rate-film";
export const HOT_FILM = "/film/hot-film";
export const GET_COMMENT = "/film/get-comment";
export const GET_ADS = "/ads/get-all";
export const GET_ONE_CATEGORY = "/film/category-one";
export const GET_ONE_COUNTRY = "/film/country-one";
export const UPDATE_VIEW = "/film/update-view";

export const fetchOrigin = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
};
