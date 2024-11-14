import { isEmpty } from "lodash";
import axios from "./axiosInstance";
import {
  BASE_URL_API,
  // BASE_URL_FRONTEND_NO_PROTOCOL,
  GET_FILM_BY_FILTER,
  GET_FILM_FROM_SLUG,
  GET_HIGH_RATE,
  TOTAL_STAR,
  fetchOrigin,
  isBrowser,
  IMAGE_BASE_URL,
  BASE_URL_FRONTEND,
} from "./constant";
import axiosInstance from "./axiosInstance";
import { SITE_CONFIG } from "@/configs/metadata-config";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getElement(classOrId: string) {
  const el = document.querySelector(classOrId);
  return el;
}

export function getAllElement(classOrTag: string) {
  const els = document.querySelectorAll(classOrTag);
  return Array.from(els) as HTMLElement[];
}

export function removeCatgoryDuplicates(arr: any[]) {
  const uniqueItems = new Map();

  arr.forEach((item) => {
    uniqueItems.set(item.slug, item);
  });

  return Array.from(uniqueItems.values());
}

export function isAlphabetic(str: string): boolean {
  // Kiểm tra xem chuỗi chỉ chứa các ký tự alphabet, số và khoảng trắng
  // Bao gồm cả các ký tự có dấu tiếng Việt
  return /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơỲÝỴỶỸỳýỵỷỹẠ-ỹ0-9\s]+$/.test(
    str
  );
}
export function convertToSlug_v2(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (char) => (char === "đ" ? "d" : "D"))
    .replace(/[^a-z0-9]/g, "-");
}

export function convertAlphabetToSlug(str: string) {
  // Chuyển hết sang chữ thường
  str = str.toLowerCase();

  // xóa dấu
  str = str
    .normalize("NFD") // chuyển chuỗi sang unicode tổ hợp
    .replace(/[\u0300-\u036f]/g, ""); // xóa các ký tự dấu sau khi tách tổ hợp

  // Thay ký tự đĐ
  str = str.replace(/[đĐ]/g, "d");

  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s])/g, "");

  // Xóa khoảng trắng thay bằng ký tự -
  str = str.replace(/(\s+)/g, "-");

  // Xóa ký tự - liên tiếp
  str = str.replace(/-+/g, "-");

  // xóa phần dư - ở đầu & cuối
  str = str.replace(/^-+|-+$/g, "");

  // return
  return str;
}

export function convertToSlug(str: string) {
  if (isAlphabetic(str)) {
    return convertAlphabetToSlug(str);
  }
  return str
    .toLowerCase()
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-") // Xóa dấu gạch ngang liên tiếp
    .replace(/^-+|-+$/g, ""); // Xóa dấu gạch ngang ở đầu và cuối
}
export function toCapitalize(inputText: string) {
  // Tách đoạn văn bản thành các từ
  const words = inputText.split(" ");

  // Lặp qua từng từ và chuyển đổi chữ cái đầu thành chữ hoa
  const capitalizedWords = words.map((word) => {
    // Nếu từ rỗng, không cần chuyển đổi
    if (word.length === 0) {
      return "";
    }

    // Chuyển đổi chữ cái đầu của từ
    const capitalizedWord =
      word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase();

    return capitalizedWord;
  });

  // Kết hợp lại các từ thành đoạn văn bản mới
  const resultText = capitalizedWords.join(" ");

  return resultText;
}

export function formatNumber(num: number) {
  if (Number.isNaN(num)) return 0;
  if (num >= 1000) {
    // Chuyển số thành dạng K, ví dụ: 1000 => 1K, 3600 => 3.6K
    return (num / 1000).toFixed(1) + "K";
  }
  // Trả về số nguyên nếu số không đạt yêu cầu
  return num.toString();
}

export const toStar = (rate: any) => {
  if (isEmpty(rate)) return `0/${TOTAL_STAR}`;
  const x = (
    rate.reduce((acc: any, current: any) => acc + current.star_number, 0) /
    rate.length
  ).toFixed(1);
  if (Number.isNaN(x)) {
    return `0/${TOTAL_STAR}`;
  }
  return `${x}/${TOTAL_STAR}`;
};

export function formatDateTime(dateTimeString: string) {
  return new Date(dateTimeString).toLocaleString("vi-VN", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function calculateStatus(
  current_episode: any,
  totalEpisode: any, //number
  quality?: any
) {
  if (quality === "Trailer") return quality;
  if (totalEpisode === "Tập FULL" || totalEpisode == 1) {
    return "Tập FULL";
  }
  let total = 0;
  if (totalEpisode.trim().toLowerCase().endsWith("tập")) {
    total = +totalEpisode.trim().toLowerCase().split("tập")[0];
  } else {
    total = +totalEpisode.trim();
  }

  if (+current_episode >= +total && total != 0) {
    return `Hoàn tất ${+total}/${+total}`;
  } else if (
    totalEpisode === "?" ||
    totalEpisode === "??" ||
    totalEpisode == 0
  ) {
    return `Tập ${current_episode}`;
  } else if (+current_episode < +total) {
    return `Tập ${current_episode}/${+total}`;
  } else {
    return "Không xác định";
  }
}

export function getValueCategory(label: string) {
  if (!label) return;
  const result = label.toLowerCase().trim().replace(" ", "-");
  return result;
}

export const getDataFromSlug = async (slug: string): Promise<any | null> => {
  const ress = await axiosInstance.post(
    GET_FILM_FROM_SLUG,
    { slug: slug },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (ress.status != 200) return null;
  return ress.data.item;
};

export function removeDuplitcateFromArray(arr: any[]) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function removeDuplitcateFromArray_v2(arr: any[]) {
  return Array.from(new Set(arr));
}

export function removeDuplitcateFromArray_v3(arr: any[]) {
  return arr.reduce((acc, current) => {
    if (acc.indexOf(current) === -1) {
      acc.push(current);
    }
    return acc;
  }, []);
}

export function removeDuplitcateFromArray_v4(arr: any[]) {
  return arr.reduce(
    (acc, current) => (acc.includes(current) ? acc : [...acc, current]),
    []
  );
}

export async function getListCategory(): Promise<any[]> {
  try {
    let dataList: any[] = [];
    const ress = await fetch(`${BASE_URL_API}/film/category-client`, {
      next: { revalidate: 7 * 24 * 60 * 60, tags: ["list-category"] },
    });
    if (ress.ok) {
      const data = await ress.json();
      if (!isEmpty(data.list)) {
        const lst = removeCatgoryDuplicates(data.list)?.map((e: any) => ({
          label: e.name,
          value: e.slug,
          isDeleted: e.isDeleted,
          slug: e.slug,
        }));
        dataList = lst;
      } else {
        dataList = [];
      }
    } else {
      console.log("Error get list category: ", ress.statusText);
      dataList = [];
    }

    return dataList;
  } catch (error: any) {
    console.log("Catch Error get list category: ", error);
    return [];
  }
}

// export async function getSomeCategory(categories: any[]) {
//   const list = Array.isArray(categories) ? categories : [categories];
// }

export async function deleteCategory(category: string) {
  let res = false;
  const response = await axios.post("/film/category/delete", {
    category: category,
  });
  if (response.data) {
    res = response.data.result;
  } else {
    res = false;
  }
  return res;
}

export async function createCategory(categories: string[]) {
  let res = false;
  const response = await axios.post("/film/category/create", {
    category: categories,
  });
  if (response.data) {
    res = response.data.result;
  } else {
    res = false;
  }
  return res;
}

export async function getListCountry() {
  try {
    let dataList: any[] = [];
    const res = await fetch(`${BASE_URL_API}/film/country`, {
      next: { revalidate: 7 * 24 * 60 * 60, tags: ["list-country"] },
    });
    if (res.ok) {
      const data = await res.json();
      if (!isEmpty(data.listCountry)) {
        const lst = removeCatgoryDuplicates(data.listCountry).map((e: any) => ({
          label: e.name,
          value: e.slug,
          isDeleted: e.isDeleted,
          slug: e.slug,
        }));
        dataList = lst;
      } else {
        dataList = [];
      }
    } else {
      console.log("Error get list country: ", res.statusText);
      dataList = [];
    }
    return dataList;
  } catch (error: any) {
    console.log("Catch Error get list country: ", error);
    return [];
  }
}

export async function getListQuality() {
  try {
    let dataList = [];
    const list = await axios.get("/film/quality");
    if (!isEmpty(list.data.listQuality)) {
      const lst = removeDuplitcateFromArray_v3(list.data.listQuality).map(
        (e: any) => ({
          label: e.name,
          value: e.name,
          isDeleted: e.isDeleted,
        })
      );
      dataList = lst;
    } else {
      dataList = [];
    }
    return dataList;
  } catch (error: any) {
    console.log("Error get list quality: ", error);
    return [];
  }
}

export async function getListLanguage() {
  try {
    let dataList = [];
    const list = await axios.get("/film/language");
    if (!isEmpty(list.data.listLanguage)) {
      const lst = list.data.listLanguage.map((e: any) => ({
        label: e.name,
        value: e.name,
        isDeleted: e.isDeleted,
      }));
      dataList = lst;
    } else {
      dataList = [];
    }
    return dataList;
  } catch (error: any) {
    console.log("Error get list language: ", error);
    return [];
  }
}
// export async function getListFilm(url: string, filters?: any) {
//   const result = await axios.post(url, filters ?? {}, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
//   if (!isEmpty(result.data)) {
//     return result.data;
//   } else return null;

// }

export async function getListFilm(url: string, filters?: any) {
  try {
    // console.log("hehehe >>", filters)
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...fetchOrigin,
      },
      body: JSON.stringify(filters ?? {}),
      next: { revalidate: 900, tags: ["phim-tinh-cam"] }, // xác thực lại dữ liệu trong vòng 15 phút
    });

    if (!response.ok) {
      return [];
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();

    if (!isEmpty(jsonData.result)) {
      return jsonData.result;
    } else {
      return [];
    }
  } catch (error) {
    // console.error('An error occurred:', error);
    return [];
  }
}

export async function getListData_v1() {
  const listCategory = await getListCategory();
  const listCountry = await getListCountry();
  const listQuality = await getListQuality();
  return { listCategory, listCountry, listQuality };
}

export async function getListData() {
  try {
    const [listCategory, listCountry, listQuality] = await Promise.allSettled([
      getListCategory(),
      getListCountry(),
      getListQuality(),
    ]);
    return { listCategory, listCountry, listQuality };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { listCategory: [], listCountry: [], listQuality: [] };
  }
}
export async function fetchDataListCartoon() {
  const res = await fetch(`${BASE_URL_API}${GET_FILM_BY_FILTER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...fetchOrigin,
    },
    body: JSON.stringify({
      filters: { category: ["Hoạt Hình"], quality: { $ne: "Trailer" } },
      limit: 12,
    }),
    next: { revalidate: 1800, tags: ["list-film-cartoon"] },
  });
  if (res.ok) {
    const data_tmp = await res.json();
    return data_tmp;
  } else {
    return {
      result: [],
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function fetchDataListFromAnyCategory(
  categoryName: string | string[]
) {
  const cate = typeof categoryName === "string" ? [categoryName] : categoryName;
  const res = await fetch(`${BASE_URL_API}${GET_FILM_BY_FILTER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...fetchOrigin,
    },
    body: JSON.stringify({
      filters: { category: cate, quality: { $ne: "Trailer" } },
      limit: 12,
    }),
    next: { revalidate: 1800, tags: ["list-film-custom"] },
  });
  if (res.ok) {
    const data_tmp = await res.json();
    return data_tmp;
  } else {
    return {
      result: [],
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export async function fetchDataHighRate() {
  const res = await fetch(`${BASE_URL_API}${GET_HIGH_RATE}`, {
    method: "POST",
    headers: {
      ...fetchOrigin,
    },
    next: { revalidate: 3600, tags: ["high-rate"] },
  });

  if (res.ok) {
    const data = await res.json();
    return data;
  } else {
    return { result: [] };
  }
}

export async function returnDefaultImageURL(thumbnail: string) {
  const imgSrc = isEmpty(thumbnail) ? "/blur_img.webp" : thumbnail;
  if (imgSrc === "/blur_img.webp") {
    return imgSrc;
  }
  let urlFetch = "";
  if (imgSrc.startsWith("http")) {
    urlFetch = imgSrc;
  } else {
    urlFetch = `${BASE_URL_API}/${imgSrc}`;
  }

  const fetchImg = await fetch(urlFetch, {
    headers: { ...fetchOrigin },
  });
  if (!fetchImg.ok) {
    return "/bg-match-item.png";
  } else {
    if (imgSrc.startsWith("http")) {
      return imgSrc;
    } else {
      return `${BASE_URL_API}/${imgSrc}`;
    }
  }
}

export function returnDefaultImageURL_v2(thumbnail: string) {
  // return "/bg-match-item.png";
  const imgSrc = isEmpty(thumbnail)
    ? "/blur_img.webp"
    : thumbnail === "https://phim.nguonc.com"
      ? "/bg-match-item.png"
      : thumbnail.startsWith("http")
        ? thumbnail
        : `${IMAGE_BASE_URL}/${thumbnail}`;
  return imgSrc;
  if (imgSrc === "/blur_img.webp") {
    return imgSrc;
  }
  let urlFetch = "";
  if (imgSrc.startsWith("http")) {
    urlFetch = imgSrc;
  } else {
    urlFetch = `${BASE_URL_API}/${imgSrc}`;
  }

  return urlFetch;
}

export function formatPlayedTime(
  seconds: number | string,
  isShowFull?: boolean
) {
  const days = Math.floor(+seconds / 86400);
  const hours = Math.floor((+seconds % 86400) / 3600);
  const minutes = Math.floor((+seconds % 3600) / 60);
  const sec = Math.floor(+seconds % 60);

  let timeString;
  if (isShowFull === true) {
    timeString = `${days > 0 ? days + " ngày " : ""}${
      hours > 0 ? hours + " giờ " : ""
    }${minutes > 0 ? minutes + " phút " : ""}${sec} giây`;
  } else {
    timeString = `${days >= 1 ? `${days}:` : ""}${hours > 0 ? `${hours}:` : ""}${
      minutes > 0 ? `${minutes}` : "00"
    }:${sec > 0 ? `${sec}` : "00"}`;
  }

  return timeString;
}

export function playingTimeOnDuration(played: string, duration: string) {
  return `${played} / ${duration}`;
}

export function scrollToTop(top?: number) {
  if (isBrowser) {
    window.scrollTo({ top: top || 0, behavior: "smooth" });
  }
}

export function getFullDate(time: string | number) {
  // ví dụ time = 2024-03-30T12:30:00.000000Z
  // console.log("time string: ", time)
  const date = new Date(time);
  // console.log("trong ham: ", date);
  const fullDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const fullMonth =
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minutes =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return {
    fullDateTime: `${fullDay}/${fullMonth}/${date.getFullYear()} - ${hours}h:${minutes}'`,
    fullTimeDate: `${hours}h:${minutes}' - ${fullDay}/${fullMonth}/${date.getFullYear()}`,
    fullDMY: `${fullDay}/${fullMonth}/${date.getFullYear()}`,
    fullYMDNotSlash: `${date.getFullYear()}${fullMonth}${fullDay}`,
    time: `${hours}h:${minutes}`,
    date,
    fullDay,
    fullMonth,
    hours,
    minutes,
    years: date.getFullYear(),
    miliseconds: date.getMilliseconds(),
    dayMonth: `${fullDay}/${fullMonth}`,
  };
}

export function checkCurrentEpisode(slug: string[], item: any) {
  if (!slug[1]) {
    return item.list_episode[0].list_link[0];
  }
  if (slug[1] === "tap-trailer") {
    return "trailer";
  }
  let checkCurrentEp: any | undefined | null;
  if (slug[1].includes("embed")) {
    checkCurrentEp = item.list_episode[0].list_link.find(
      (el: any) => el.slug === slug[1].trim()
    );
  } else {
    checkCurrentEp = item.list_episode[1].list_link.find(
      (el: any) => el.slug === slug[1].trim()
    );
  }
  return checkCurrentEp;
}

export function generateMetadataForXemPhim(
  item: any,
  slug: string[],
  thumbnail: string,
  previousImages: any
) {
  let title = "";
  // if (!slug[1]) {
  //   if (
  //     item.quality === "Trailer" ||
  //     isEmpty(item?.list_episode[1]?.list_link[0]?.link)
  //   ) {
  //     title = `Xem Trailer Phim ${toCapitalize(item.title)} chất lượng cao | Trailer Phim ${toCapitalize(item.title)} ${item.quality} | ${SITE_CONFIG.home}`;
  //   } else {
  //     title = `Xem Phim ${toCapitalize(item.title)} - Tập 1 chất lượng cao | Phim ${toCapitalize(item.title)} ${item.quality} | ${SITE_CONFIG.home}`;
  //   }
  // }

  const checkCurrentEp: any | string | undefined | null = checkCurrentEpisode(
    slug,
    item
  );
  if (slug[1] === "tap-trailer" || checkCurrentEp === `trailer`) {
    title = `Xem Trailer Phim ${toCapitalize(item.title)} chất lượng cao | Phim ${toCapitalize(item.title)} ${item.quality} | ${SITE_CONFIG.home}`;
  }

  if (checkCurrentEp) {
    if (checkCurrentEp === `trailer`) {
      title = `Xem Trailer Phim ${toCapitalize(item.title)} chất lượng cao | Phim ${toCapitalize(item.title)} ${item.quality} | ${SITE_CONFIG.home}`;
    } else {
      const currentEpName = checkCurrentEp?.title?.toLowerCase().includes("tập")
        ? checkCurrentEp.title
        : `Tập ${checkCurrentEp.title}`;
      title = `Xem Phim ${toCapitalize(item.title)} - ${currentEpName} chất lượng cao | Phim ${toCapitalize(item.title)} ${item.quality} | ${SITE_CONFIG.home}`;
    }
  } else {
    title = `Xem Phim ${toCapitalize(item.title)} - Tập 1 chất lượng cao | Phim ${toCapitalize(item.title)} ${item.quality} | ${SITE_CONFIG.home}`;
  }

  return {
    title: title,
    description: item ? item.description ?? item.title : "",
    openGraph: item
      ? {
          images: [`${thumbnail}`, ...previousImages],
        }
      : undefined,
    metadataBase: new URL(BASE_URL_FRONTEND),
    keywords: item.keywords,
  };
}

export async function fetchAds() {
  // return null;
  try {
    let ress = null;
    if (isBrowser) {
      ress = await fetch(`${BASE_URL_FRONTEND}/api/ads`, {
        cache: "no-cache",
      });
      console.log("Fetch ads from client side");
    } else {
      ress = await fetch(`http://localhost:6868/api/ads`, {
        cache: "no-cache",
      });
      console.log("Fetch ads from server side");
    }
    if (ress?.ok) {
      return await ress.json();
    }
    return null;
  } catch (error: any) {
    console.log("Error fetch ads: ", error?.message);
    return null;
  }
}

export async function retry(
  fn: any,
  fname?: string,
  retries = 3,
  delay = 1000
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < retries - 1) {
        console.log(`Retrying function ${fname}... (${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.log("Catch at retry", error);
        throw error;
      }
    }
  }
}

export async function withRetryListFunction(listFuncion: any[]) {
  const pormises = listFuncion.map((fn) => retry(fn));
  return await Promise.all(pormises);
}
