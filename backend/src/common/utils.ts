import { forEach, isEmpty } from "lodash";
import { randomBytes } from "crypto";

import CountryModel from "../model/country";
import FilmModel from "../model/film";
import { downloadAndProcessImage } from "../middleware/downloadAndUploadImage";
import { generateRandomRates, generateRandomViews } from "./fake";
import {
  checkAndAddCategories,
  checkAndAddCountries,
  checkAndAddLanguages,
  checkAndAddQuality,
  createCountry,
  createLanguage,
} from "../controller/film";
import { existsSync, unlinkSync } from "fs";
import path from "path";

export const PROD = process.env.NODE_ENV === "production";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

export function generateString(length: any) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function generateRefreshToken() {
  return randomBytes(32).toString("hex");
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

export function parseListEpisode(list: any[]) {
  const result: any[] = [];
  if (!isEmpty(list)) {
    const data = list.map((e) => e.server_data ?? e.items);
    // Tạo một đối tượng để lưu trữ kết quả

    // Lặp qua từng phần tử trong mảng dữ liệu ban đầu
    data.forEach((episode: any, index) => {
      const serverNameEmbed = `Server VIP #${index + 1} - Embed`;
      const serverNameM3U8 = `Server VIP #${index + 1} - M3U8`;

      const listLinkEmbed = episode.map((el: any) => ({
        title: el.name,
        link: el.link_embed ?? el.embed,
        slug: convertAlphabetToSlug(`${el.name} ${serverNameEmbed}`),
      }));

      const listLinkM3U8 = episode.map((el: any) => ({
        title: el.name,
        link: el.link_m3u8 ?? el.m3u8,
        slug: convertAlphabetToSlug(`${el.name} ${serverNameM3U8}`),
      }));

      // Thêm server cho link_embed
      result.push({
        name: serverNameEmbed,
        list_link: listLinkEmbed,
      });

      // Thêm server cho link_m3u8
      result.push({
        name: serverNameM3U8,
        list_link: listLinkM3U8,
      });
    });
  }
  return result;
}

export function parseListEpisodeYuthanhthien(list: any[]) {
  const result: any[] = [];
  if (!isEmpty(list)) {
    for (let i = 0; i < list[0].servers.length; i++) {
      const data = list.map((e) => ({
        title: e?.name,
        link: e.servers[0].link,
        slug: convertAlphabetToSlug(`${e.name} Server #${i + 1}`),
      }));

      result.push({
        name: `Server #${i + 1}`,
        list_link: data,
      });
    }
  }
  return result;
}

export function formatCategoryFromKKPhimOphim(category: any[], item: any) {
  let categories: string[] = [];
  if (!isEmpty(category) && Array.isArray(category) && category.length > 0) {
    let tmpCate: string[] = [];
    if (typeof category[0] === "string") {
      tmpCate = category;
    } else {
      tmpCate = category.map((e) => e?.name?.trim() as string);
    }
    categories = tmpCate.map((e) => {
      const capitalize = toCapitalize(e?.trim());
      if (
        e?.trim() === "Giả Tượng" ||
        e?.trim() === "Viễn Tượng" ||
        e?.trim() === "Giả Tưởng"
      ) {
        return "Viễn Tưởng";
      } else if (e?.trim() === "Hài" || e?.trim() === "Phim Hài") {
        return "Hài Hước";
      } else if (e?.trim() === "Nhạc" || e?.trim() === "Phim Nhạc") {
        return "Âm Nhạc";
      } else if (
        e?.trim() === "Chương Trình Truyền Hình" ||
        e?.trim() === "Tv Shows"
      ) {
        return "TV Shows";
      } else if (e?.trim() === "Action &amp; Adventure") {
        return "Hành Động - Phiêu Lưu";
      } else if (e?.trim()?.startsWith("Sci-fi")) {
        return "Viễn Tưởng";
      }
      return capitalize;
    });
  } else {
    categories = [];
  }
  if (item?.chieurap === true || item?.chieurap === "true") {
    categories = [...categories, "Phim Chiếu Rạp"];
  }
  if (item?.type === "tvshows") {
    categories = [...categories, "TV Shows"];
  }
  if (item?.type === "hoathinh") {
    categories = [...categories, "Hoạt Hình"];
  }
  return categories;
}

export async function returnFilmObject(item: any, source?: string) {
  const thumb = !isEmpty(item?.movie?.thumb_url)
    ? await downloadAndProcessImage(
        item?.movie?.thumb_url,
        "thumbnail",
        50,
        convertAlphabetToSlug(item.movie?.name?.trim())
      )
    : "";
  const poster_img = !isEmpty(item?.movie?.poster_url)
    ? await downloadAndProcessImage(
        item?.movie?.poster_url,
        "poster",
        50,
        convertAlphabetToSlug(item.movie?.name?.trim())
      )
    : "";

  const category: any = item?.movie?.category;
  const categories: any = formatCategoryFromKKPhimOphim(category, item);

  let total: string = item?.movie?.total_episodes
    ? `${item?.movie?.total_episodes}`
    : `${item?.movie?.episode_total}`;
  if (+total === 1) {
    total = "Tập FULL";
  } else if (total.trim().toLowerCase().endsWith("tập")) {
    total = total.split(" ")[0];
  } else if (total.trim().startsWith("?")) {
    total = "?";
  } else if (isEmpty(total) || total === "") {
    total = "?";
  } else {
    total = total;
  }

  let list_eps = parseListEpisode(item.episodes);
  const year = item.movie.year?.toString() ?? "";

  const countries = item.movie.country
    ? item.movie.country.map((country: any) => {
        switch (country.name?.trim().toLowerCase()) {
          case "vietnam":
            return "Việt Nam";
          default:
            return toCapitalize(country.name?.trim());
        }
      })
    : [];

  const langs = countries.map((name: string) => `Tiếng ${name}`.trim());
  const tmp_quality =
    item.movie.status === "trailer"
      ? "Trailer"
      : convertQuality(item.movie.quality)
        ? convertQuality(
            `${item.movie.quality} ${item.movie.lang ?? item.movie.language ?? ""}`
          )
        : "";
  // Check language, country, quality, category xem có ở trong DB chưa, nếu chưa có thì thêm vô DB

  await checkAndAddLanguages(langs);
  await checkAndAddCategories(categories);
  await checkAndAddCountries(countries);
  await checkAndAddQuality(tmp_quality);
  const keywords = item.movie.origin_name
    ? addKeywords([item.movie?.name, item.movie.origin_name])
    : addKeywords([item.movie.origin_name]);

  // Xử lý phần movie
  const film = {
    title: item.movie?.name?.trim(),
    secondary_title: item.movie.origin_name || item.movie.original_name || "",
    description: item.movie.content ?? "",
    thumbnail: thumb ?? "",
    poster: poster_img ?? "",
    category: categories,
    year_release: year,
    duration: item.movie.time ?? "",
    total_episode: total,
    list_episode: list_eps,
    language: langs ?? [],
    country: countries,
    quality: tmp_quality,
    comments: [],
    director: item.movie.director ?? [],
    performer: !isEmpty(item.movie.casts)
      ? item.movie.casts.map((e: string) => e?.trim())
      : item.movie.actor.map((e: string) => e?.trim()) ?? [],
    outstanding: item.movie.sub_docquyen === true ? "Nổi bật" : "",
    slug: convertAlphabetToSlug(item.movie?.name) ?? "",
    rate: generateRandomRates(),
    views: generateRandomViews(),
    notify: "",
    trailer_url: item.movie.trailer_url ?? "",
    keywords: keywords,
    source,
    origin_api_slug: item.movie.slug,
    isDeleted: false,
  };
  return film;
}

export async function returnFilmObjectFromNguonC(item: any) {
  const thumb = !isEmpty(item?.movie?.thumb_url)
    ? await downloadAndProcessImage(
        item?.movie?.thumb_url,
        "thumbnail",
        50,
        convertAlphabetToSlug(item?.movie?.name?.trim())
      )
    : "";
  const poster_img = !isEmpty(item?.movie?.poster_url)
    ? await downloadAndProcessImage(
        item?.movie?.poster_url,
        "poster",
        50,
        convertAlphabetToSlug(item?.movie?.name?.trim())
      )
    : "";

  // let categories = !Array.isArray(item.movie.category)
  //   ? (
  //       Object.values(item.movie.category as any).find(
  //         (e: any) => e.group.name === "Thể loại"
  //       ) as any
  //     ).list?.map((v: any) => v.name)
  //   : (item.movie.category as []).map((e: any) => e?.name) ?? [];

  let categories: string[] = [];
  const category: any = item?.movie?.category;

  if (!isEmpty(category)) {
    const lstCate: any = Object.values(category).find(
      (el: any) => el.group.name === "Thể loại"
    );
    if (!isEmpty(lstCate)) {
      const lst = lstCate.list as any[];
      categories = formatCategoryFromKKPhimOphim(lst, item);
    }
  }
  let total: string = item?.movie?.total_episodes.toString().trim();

  if (+total === 1) {
    total = "Tập FULL";
  } else if (total.toLowerCase().endsWith("tập")) {
    total = total.split(" ")[0];
  } else if (total.startsWith("?")) {
    total = "?";
  } else if (isEmpty(total) || total === "") {
    total = "?";
  } else {
    total = total;
  }

  let list_eps = parseListEpisode(item.movie.episodes);
  const year =
    (Object.values(category).find((el: any) => el.group.name === "Năm") as any)
      ?.list[0].name ?? "";

  let countries: string[] = [];
  const c: any = Object.values(category).find(
    (el: any) => el.group.name === "Quốc gia"
  );
  if (!isEmpty(c)) {
    const list = c.list;
    if (!isEmpty(list) && list.length > 0) {
      countries = list.map((e: { name: string }) => {
        switch (e?.name?.trim().toLowerCase()) {
          case "vietnam":
            return "Việt Nam";
          default:
            return toCapitalize(e?.name?.trim());
        }
      });
    } else {
      countries = [];
    }
  } else {
    countries = [];
  }
  const langs = isEmpty(countries)
    ? []
    : countries.map((name: string) => `Tiếng ${name}`) || [];
  const tmp_quality =
    item.movie.current_episode === "trailer"
      ? "Trailer"
      : convertQuality(item.movie.quality)
        ? `${convertQuality(item.movie.quality + " " + item.movie.language) ?? ""}`
        : "";
  // Check language, country, quality, category xem có ở trong DB chưa, nếu chưa có thì thêm vô DB

  if (!isEmpty(langs)) {
    await checkAndAddLanguages(langs);
  }
  if (!isEmpty(categories)) {
    await checkAndAddCategories(categories);
  }
  if (!isEmpty(countries)) {
    await checkAndAddCountries(countries);
  }
  if (tmp_quality && tmp_quality !== "") {
    await checkAndAddQuality(tmp_quality);
  }
  const keywords = item.movie.original_name
    ? addKeywords([item.movie?.name, item.movie.original_name])
    : addKeywords([item.movie?.name]);

  // Xử lý phần movie
  const film = {
    title: item.movie?.name?.trim(),
    secondary_title: item.movie.original_name ?? "",
    description: item.movie.description || "",
    thumbnail: thumb ?? "",
    poster: poster_img ?? "",
    category: categories,
    year_release: year,
    duration: item.movie.time ?? "",
    total_episode: total,
    list_episode: list_eps,
    language: langs ?? [],
    country: countries,
    quality: tmp_quality,
    comments: [],
    director: item.movie.director ?? [],
    performer: !isEmpty(item.movie.casts)
      ? item.movie.casts.trim().split(", ")
      : [],
    outstanding: item.movie.sub_docquyen === true ? "Nổi bật" : "",
    slug: convertAlphabetToSlug(item.movie?.name) ?? "",
    rate: generateRandomRates(),
    views: generateRandomViews(),
    notify: "",
    trailer_url: item.movie.trailer_url ?? "",
    keywords: keywords,
    source: "NguonC",
    origin_api_slug: item.movie.slug,
    isDeleted: false,
  };
  return film;
}

export async function returnFilmObjectForYuthanhthien(item: any) {
  const lstCountry = [
    {
      name: "Thái Lan",
      slug: "thai-lan",
    },
    {
      name: "Nhật Bản",
      slug: "nhat-ban",
    },
    {
      name: "Đài Loan",
      slug: "dai-loan",
    },
    {
      name: "Trung Quốc",
      slug: "trung-quoc",
    },
    {
      name: "Hàn Quốc",
      slug: "han-quoc",
    },
    {
      name: "Phillipines",
      slug: "phillipines",
    },
    {
      name: "Hồng Kông",
      slug: "hong-kong",
    },
  ];

  const thumb = !isEmpty(item.image)
    ? await downloadAndProcessImage(item.image.o, "thumbnail")
    : "";
  const categories = ["Tình Cảm", "Tâm Lý", "Boy Love"];
  const listEps = parseListEpisodeYuthanhthien(item.episodes);
  const totalEp =
    item.completed === true
      ? item.episodes.length === 1
        ? "Tập FULL"
        : item.episodes.length
      : "?";

  const countries = await CountryModel.find({});
  const check = lstCountry.find((e) => e.slug === item.country)!;
  const countryIsExist = countries.find((e) => e?.name === check.name);
  if (!countryIsExist) {
    await createCountry(check.name);
    await createLanguage(`Tiếng ${check.name}`);
  }

  const film = {
    title: item.title,
    secondary_title: "",
    description: "",
    thumbnail: thumb ?? "",
    poster: "",
    category: categories,
    year_release: new Date(item.date).getFullYear(),
    duration: item.time ?? "",
    total_episode: totalEp,
    list_episode: listEps,
    language: [`Tiếng ${check.name}`],
    country: [check.name],
    quality: "HD Vietsub",
    comments: [],
    director: item.director ?? [],
    performer: item.actor ?? [],
    outstanding: "Yu thánh thiện",
    slug: convertAlphabetToSlug(item.title) ?? "",
    rate: generateRandomRates(),
    views: generateRandomViews(),
    notify: item.note,
    trailer_url: "",
    keywords: addKeywords([item.title]),
    isDeleted: false,
  };
  return film;
}

export function removeVietnameseAccent(str: string) {
  const isVietnamese = /[^\u0000-\u007F]/.test(str);
  if (!isVietnamese) {
    return {
      lower: str.toLowerCase(),
      normal: str,
    };
  }
  // remove accents
  const from =
    "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ";
  const to =
    "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(RegExp(from[i], "gi"), to[i]);
  }

  // str = str.toLowerCase()
  //       .trim()
  //       .replace(/[^a-z0-9\-]/g, '-')
  //       .replace(/-+/g, '-');

  return {
    lower: str.toLowerCase(),
    normal: str,
  };
}

export function addKeywords(dataText: string[] | string) {
  const str = !Array.isArray(dataText) ? [dataText] : dataText;
  const keywords: string[] = [];
  const newKeywords: string[] = [];

  if (dataText.length > 0) {
    str.forEach((text) => {
      const isVietnamese = /[^\u0000-\u007F]/.test(text);
      keywords.push(text);
      if (isVietnamese) {
        const res = removeVietnameseAccent(text);
        keywords.push(res.lower, res.normal);
      }
      const otherVersions = [
        "lồng tiếng",
        "thuyết minh",
        "Vietsub",
        "long tieng",
        "thuyet minh",
      ];

      keywords.forEach((keyword) => {
        otherVersions.forEach((e) => {
          newKeywords.push(keyword + " " + e);
        });
      });
    });
  }

  return [...keywords, ...newKeywords];
}

export async function deleteImage(imagePath: string) {
  try {
    const fullPath = path.join("static", imagePath); // Điều chỉnh đường dẫn tĩnh của bạn
    console.log("fullpath: ", fullPath);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
      console.log(`Deleted image at path: ${fullPath}`);
    } else {
      console.log(`Image not found at path: ${fullPath}`);
    }
  } catch (error) {
    console.error(`Error deleting image at path: ${imagePath}`, error);
  }
}

export function convertQuality(quality: string) {
  if (!quality) throw Error("Quality is required");

  if (quality.toLowerCase().startsWith("full")) {
    const splitter = quality.toLowerCase().split("hd");
    const str = splitter.map((part) => {
      switch (part.trim()) {
        case "full":
          return "FullHD";
        default:
          return toCapitalize(part);
      }
    });
    return str.join(" ").trim();
  }
  const splitter = quality.toLowerCase().split(" ");
  const str = splitter.map((s) => {
    switch (s.trim()) {
      case "hd":
        return "HD";
      case "sd":
        return "SD";
      case "cam":
        return "CAM";
      case "fhd":
        return "FHD";
      default:
        return toCapitalize(s);
    }
  });
  return str.join(" ").trim();
}
