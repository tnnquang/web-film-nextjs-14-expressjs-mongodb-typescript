import axios from "axios";
import mongoose from "mongoose";
import { first, isEmpty } from "lodash";
import { writeFileSync } from "fs";

import FilmModel from "../model/film";
import QualityModel from "../model/quality";
import CountryModel from "../model/country";
import LanguageModel from "../model/language";
import CategoryModel from "../model/filmCategory";
import {
  convertToSlug,
  deleteImage,
  generateString,
  returnFilmObject,
  returnFilmObjectForYuthanhthien,
  toCapitalize,
  // sleep,
} from "../common/utils";
import { invalidateCache, client } from "../middleware/caching";

// import { downloadAndUploadImage } from "../middleware/downloadAndUploadImage";
// import {
//   generateRandomComments,
//   generateRandomRates,
//   generateRandomViews,
// } from "../common/fake";

const conn = mongoose.connection;

const baseUrl = (urlType: 1 | 2 | 3) =>
  urlType == 1 ? "https://ophim1.com" : "https://phimapi.com";

const themPhimLoi: any[] = [];

async function fetchMovieDetail(slug: string, urlType: 1 | 2 | 3 = 1) {
  const _baseUrl =
    urlType > 2 ? "https://phim.nguonc.com/api/film" : baseUrl(urlType);
  const url =
    urlType === 3 ? `${_baseUrl}/${slug}` : `${_baseUrl}/phim/${slug}`;
  try {
    const movieDetailResponse = await axios.get(url, {
      timeout: 10800, // timeout 3 phut
    });
    return movieDetailResponse.data;
  } catch (error: any) {
    console.log("Get phim lỗi: ", slug);
    themPhimLoi.push({ slug });
    return { movie: { slug, name: slug }, episodes: {} };
  }
}

export async function processPage(
  pageNum: number,
  urlType: 1 | 2 | 3 = 1,
  collectionName?: string
) {
  const _baseUrl =
    urlType > 2 ? "https://phim.nguonc.com/api/films" : baseUrl(urlType);
  const url =
    urlType === 3
      ? `${_baseUrl}/phim-moi-cap-nhat?page=${pageNum}`
      : `${_baseUrl}/danh-sach/phim-moi-cap-nhat?page=${pageNum}`;

  const dataAxios = await axios.get(url);
  const dataList = dataAxios.data;
  const collection = collectionName ?? "crawl-film";
  const bulkOps = [];

  for (const film of dataList.items) {
    const detail: any = await fetchMovieDetail(film.slug, urlType);

    // Create an update operation with upsert to insert if not exists
    const updateOp =
      urlType > 2
        ? {
            updateOne: {
              filter: { "movie.name": detail.movie.name },
              update: {
                $set: {
                  movie: detail.movie,
                },
              },
              upsert: true,
            },
          }
        : {
            updateOne: {
              filter: { "movie.name": detail.movie.name },
              update: {
                $set: {
                  movie: detail.movie,
                  episodes: detail.episodes,
                },
              },
              upsert: true,
            },
          };

    bulkOps.push(updateOp);
    console.log("Đã thêm phim vào mảng >>", film.name);
  }

  // Execute bulk write to reduce database calls
  await conn.collection(collection).bulkWrite(bulkOps);
}

export async function crawlAndSaveData(
  urlType: 1 | 2 | 3 = 1,
  collectionName?: string,
  endPage?: number
) {
  try {
    const _baseUrl =
      urlType > 2 ? "https://phim.nguonc.com/api/films" : baseUrl(urlType);
    console.log("Đang bắt đầu crawl dữ liệu phim từ >>", _baseUrl);
    const url =
      urlType === 3
        ? `${_baseUrl}/phim-moi-cap-nhat`
        : `${_baseUrl}/danh-sach/phim-moi-cap-nhat`;
    const response = await axios.get(url);
    const data = response.data;
    const totalPages =
      urlType === 3 ? data.paginate.total_page : data.pagination.totalPages;
    console.log("total pages ", totalPages);
    const pages = endPage ?? totalPages;

    // const res = [];
    for (let page = 1; page <= pages; page++) {
      console.log(`Đang chạy từ ${page} đến page ${pages}`);
      await processPage(page, urlType, collectionName);
      // res.push(...items);
      console.log("Đã thêm dữ liệu hoàn tất cho trang  >> ", page);
    }

    console.log("All pages processed save successfully");
    writeFileSync("get film error.json", JSON.stringify(themPhimLoi));
  } catch (error: any) {
    console.error("Error:", error);
  }
}

export async function saveFilmYuthanhthien(item: any) {
  try {
    const film = await returnFilmObjectForYuthanhthien(item);
    const newFilm = new FilmModel(film);
    await newFilm.save();
    console.log("Lưu thành công phim >> ", item.title);
  } catch (error: any) {
    console.log(
      "Lỗi lưu phim >> ",
      error?.message ?? error + " >> " + item.name
    );
  }
}

export async function saveFilm(item: any) {
  try {
    const film = await returnFilmObject(item);

    const newFilm = new FilmModel(film);
    await newFilm.save();
    console.log("Lưu thành công phim >> ", item.movie.name);
  } catch (error: any) {
    console.log(
      "Lỗi lưu phim >> ",
      error?.message ?? error + " >> " + item.name
    );
  }
}

export async function saveListFilms(
  pageSize?: number,
  sourceCollection?: string,
  isYu: boolean = false
) {
  try {
    const collection = sourceCollection ?? "crawl-phim"; //Collection lưu danh sách phim nguồn

    const len = await conn.collection(collection).countDocuments();
    console.log("Số lương phim: ", len);
    const limit = pageSize ?? 100;
    // Tính số trang
    const totalPages = Math.ceil(len / limit);
    for (let i = 1; i <= totalPages; i++) {
      const arrayListData = await conn
        .collection(collection)
        .find()
        .skip(i * limit)
        .limit(limit)
        .toArray();
      for (const item of arrayListData) {
        const compareName = isYu ? item.title : item.movie.name;
        const checked = await FilmModel.findOne({ title: compareName });
        if (!checked) {
          isYu ? await saveFilmYuthanhthien(item) : await saveFilm(item);

          console.log(`Phim >> ${compareName} << đã được lưu thành công`);
        }
      }
      console.log("Đã lưu xong trang >> ", i);
    }
  } catch (error: any) {
    console.error("Lỗi khi lưu danh sách phim: ", error?.message ?? error);
  }
}

// Hàm kiểm tra và thêm mới ngôn ngữ
// export const checkAndAddLanguage = async (language: any) => {
//   const languageNames = Array.isArray(language) ? language : [language];

//   for (const languageName of languageNames) {
//     const existingLanguage = await LanguageModel.findOne({
//       name: languageName,
//     });

//     if (!existingLanguage) {
//       // Nếu ngôn ngữ chưa tồn tại, thêm mới
//       console.log("language >> ", languageName)
//       const newLanguage = new LanguageModel({ name: languageName});
//       await newLanguage.save();
//     }
//   }
// };

export const checkAndAddLanguages = async (languages: any) => {
  console.log("Đang vào hàm kiểm tra và thêm mới language");
  const languageNames = Array.isArray(languages) ? languages : [languages];

  for (const languageName of languageNames) {
    // console.log("Trong for");
    try {
      const existingLanguage = await LanguageModel.findOne({
        name: { $regex: new RegExp(languageName.trim()), $options: "i" },
      });
      console.log(
        "Sau check",
        existingLanguage
          ? "Đã tồn tại ngôn ngữ này"
          : "Chưa tồn tại, tiến hành thêm mới"
      );

      if (!existingLanguage) {
        // Nếu ngôn ngữ chưa tồn tại, thêm mới
        console.log("language >> ", languageName);
        const newLanguage = new LanguageModel({
          name: toCapitalize(languageName.trim()),
        });
        await newLanguage.save();
      }
    } catch (error) {
      console.error("Lỗi trong quá trình kiểm tra và thêm ngôn ngữ:", error);
    }
  }
};

// Hàm kiểm tra và thêm mới category

export const checkAndAddCategory = async (category: any) => {
  console.log("Đang vào category");
  const categories = Array.isArray(category) ? category : [category];

  for (const categoryName of categories) {
    const existingCategory = await CategoryModel.findOne({
      name: { $regex: new RegExp(categoryName.trim()), $options: "i" },
    });
    console.log("checked category >> ", existingCategory?.name);

    if (!existingCategory) {
      console.log("category >> ", categoryName);
      // Nếu category chưa tồn tại, thêm mới
      const newCategory = new CategoryModel({
        name: categoryName,
        slug: `${convertToSlug(categoryName.trim())}`,
      });
      await newCategory.save();

      console.log("Đã thêm categoryName >> ", categoryName);
    }
  }
};

export const checkAndAddCountry = async (country: any) => {
  console.log("Đang vào country");
  const countryNames = Array.isArray(country) ? country : [country];

  for (const countryName of countryNames) {
    const existingCountry = await CountryModel.findOne({
      name: { $regex: countryName.trim(), $options: "i" },
    });
    console.log("checked >> ", existingCountry);

    if (!existingCountry) {
      // Nếu country chưa tồn tại, thêm mới
      console.log("add new country >> ", countryName);
      const newCountry = new CountryModel({
        name: countryName,
        slug: `${convertToSlug(countryName)}-${generateString(5)}`,
      });
      await newCountry.save();
      console.log("Thêm country thành công >> ", countryName);
    }
  }
};

// Hàm kiểm tra và thêm mới quality

export const checkAndAddQuality = async (quality: string) => {
  console.log("Đang vào hàm check quality quality");
  try {
    const existinQuality = await QualityModel.findOne({
      name: { $regex: quality.trim(), $options: "i" },
    });

    if (!existinQuality) {
      // Nếu country chưa tồn tại, thêm mới
      console.log("quality >> ", quality);
      const newQuality = new QualityModel({
        name: toCapitalize(quality),
        slug: convertToSlug(quality),
      });
      await newQuality.save();
      console.log("Đã thêm quality >> ", quality);
    }
  } catch (error: any) {
    console.log("Lỗi khi thêm/chỉnh sửa quality: ", error?.message);
  }
};

/* Film */

export async function createCategory(names: string[]) {
  let ress = false;
  const data = names.map((e: any) => ({
    name: e,
    slug: `${convertToSlug(e)}`,
    isDeleted: false,
  }));
  const result = await CategoryModel.insertMany(data);

  if (result) {
    ress = true;
  } else {
    ress = false;
  }
  return ress;
}

export async function softDeleteCategory(name: string) {
  let ress = false;
  const data = await CategoryModel.findOne({ name: name });
  if (!data) {
    ress = false;
  }
  if (data) {
    data.isDeleted = true;
    const result = await data.save();
    if (result.isDeleted === true) {
      ress = true;
    } else {
      ress = false;
    }
  }
  return ress;
}

export async function deleteCategory(name: string) {
  try {
    // Xoá danh mục từ cơ sở dữ liệu
    const result = await CategoryModel.deleteOne({ name: name });

    // Kiểm tra xem đã xoá thành công chưa
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
}

export async function updateCategory(filters: any) {
  let ress = false;
  const data = await CategoryModel.findOne({ name: filters.old_item.label });
  if (!data) {
    ress = false;
  }
  if (data) {
    if (!isEmpty(filters.label)) {
      data.name = filters.label;
      data.slug = convertToSlug(filters.label);
    } else {
      data.isDeleted = filters.isDeleted;
    }
    await data.save();
    ress = true;
  }
  return ress;
}

export async function findOneCountry(req: any, res: any) {
  try {
    await invalidateCache(req.originalUrl);
    const slug = req.query.slug;
    const data = await CountryModel.findOne({
      $or: [{ name: slug }, { slug: slug }],
    });
    if (data) {
      const tmp = {
        name: data.name,
        slug: data.slug,
        isDeleted: data.isDeleted,
      };
      await client.set(
        req.originalUrl,
        JSON.stringify({ result: tmp }),
        "EX",
        946080000
      );
      return res.status(200).json({
        result: tmp,
        message: "Get data success",
      });
    }
    return res.json({
      result: null,
    });
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: null,
      status: 500,
    });
  }
}

export async function findOneCategory(req: any, res: any) {
  try {
    await invalidateCache(req.originalUrl);
    const slug = req.query.slug;
    // console.log("eeeeee", req.query, req.params);
    const data = await CategoryModel.findOne({
      $or: [{ name: slug }, { slug: slug }],
    });
    if (data) {
      const tmp = {
        name: data.name,
        slug: data.slug,
        isDeleted: data.isDeleted,
      };
      await client.set(
        req.originalUrl,
        JSON.stringify({ result: tmp }),
        "EX",
        946080000
      );
      return res.status(200).json({
        result: tmp,
        message: "Get data success",
      });
    }

    return res.json({
      result: null,
    });
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: null,
      status: 500,
    });
  }
}

export async function createCountry(c: string) {
  let ress = false;
  const data = { name: c, slug: `${convertToSlug(c)}-${generateString(10)}` };
  const inserted = await CountryModel.insertMany(data);
  if (inserted) {
    ress = true;
  } else {
    ress = false;
  }
  return ress;
}

export async function createLanguage(lng: string) {
  let ress = false;
  const data = { name: lng };
  const inserted = await LanguageModel.insertMany(data);
  if (inserted) {
    ress = true;
  } else {
    ress = false;
  }
  return ress;
}

export async function createQuality(q: string[]) {
  if (isEmpty(q)) return false;
  let ress = false;
  if (typeof q === "string") {
    q = [q];
  }
  // const data = { name: q, slug: convertToSlug(q) };
  const data = q.map((e: any) => ({ name: e, slug: convertToSlug(e) }));
  const inserted = await QualityModel.insertMany(data);
  if (inserted) {
    ress = true;
  } else {
    ress = false;
  }
  return ress;
}

export const checkAndAddQualities = async (qualities: any[]) => {
  try {
    // Lặp qua từng quality trong mảng
    for (const quality of qualities) {
      // Kiểm tra xem quality đã tồn tại trong database chưa
      const existingQuality = await QualityModel.findOne({
        name: quality,
      });

      // Nếu chưa tồn tại, thêm mới vào database
      if (!existingQuality) {
        const newData = new QualityModel({
          name: quality,
          slug: convertToSlug(quality),
        });
        await newData.save();
        console.log(`Thêm mới quality: ${quality}`);
      } else {
        console.log(`Quality đã tồn tại: ${quality}`);
      }
    }

    console.log("Hoàn thành kiểm tra và thêm mới");
  } catch (error) {
    console.error("Lỗi kiểm tra và thêm mới:", error);
  }
};

export const checkAndAddCountries = async (countries: any[]) => {
  try {
    for (const country of countries) {
      const existingCountry = await CountryModel.findOne({
        name: { $regex: new RegExp(country.trim()), $options: "i" },
      });

      // Nếu chưa tồn tại, thêm mới vào database
      if (!existingCountry) {
        const newData = new CountryModel({
          name: toCapitalize(country.trim()),
          slug: convertToSlug(country.trim()),
        });
        await newData.save();
        console.log(`Thêm mới country: ${country}`);
      } else {
        console.log(`country đã tồn tại: ${country}`);
      }
    }

    console.log("Hoàn thành kiểm tra và thêm mới");
  } catch (error) {
    console.error("Lỗi kiểm tra và thêm mới:", error);
  }
};

export const checkAndAddCategories = async (categories: string[]) => {
  try {
    for (const category of categories) {
      const tmp = category.trim();
      const existingCategory = await CategoryModel.findOne({
        name: { $regex: new RegExp(tmp), $options: "i" },
      });

      // Nếu chưa tồn tại, thêm mới vào database
      if (!existingCategory) {
        const newData = new CategoryModel({
          name: toCapitalize(tmp),
          slug: convertToSlug(tmp),
        });
        await newData.save();
        console.log(`Thêm mới category: ${category}`);
      } else {
        console.log(`Category đã tồn tại: ${category}`);
      }
    }

    console.log("Hoàn thành kiểm tra và thêm mới");
  } catch (error) {
    console.error("Lỗi kiểm tra và thêm mới category:", error);
  }
};

export async function findAndRemoveDuplicate(req: any, res: any) {
  const filters = await FilmModel.aggregate([
    {
      $group: {
        _id: { title: "$title" },
        count: { $sum: 1 },
        ids: { $push: "$_id" },
        thumbnails: { $push: "$thumbnail" },
        posters: { $push: "$poster" },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);
  for (const doc of filters) {
    doc.ids.shift();
    const idsToDelete = doc.ids;
    const thumbnailsToDelete = doc.thumbnails.slice(1); // Loại bỏ hình ảnh của bản ghi đầu tiên
    const postersToDelete = doc.posters.slice(1);
    await FilmModel.deleteMany({ _id: { $in: idsToDelete } });
    for (const thumbnail of thumbnailsToDelete) {
      await deleteImage(thumbnail);
    }

    for (const poster of postersToDelete) {
      await deleteImage(poster);
    }
  }
  return res.json({
    message: "Deleted all video duplicated",
    result: "OK",
  });
}

export async function findAndRemoveDuplicateLocal() {
  const filters = await FilmModel.aggregate([
    {
      $group: {
        _id: { title: "$title" },
        count: { $sum: 1 },
        ids: { $push: "$_id" },
        thumbnails: { $push: "$thumbnail" },
        posters: { $push: "$poster" },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);
  for (const doc of filters) {
    doc.ids.shift();
    const idsToDelete = doc.ids;
    const thumbnailsToDelete = doc.thumbnails.slice(1); // Loại bỏ hình ảnh của bản ghi đầu tiên
    const postersToDelete = doc.posters.slice(1);
    await FilmModel.deleteMany({ _id: { $in: idsToDelete } });
    for (const thumbnail of thumbnailsToDelete) {
      await deleteImage(thumbnail);
    }

    for (const poster of postersToDelete) {
      await deleteImage(poster);
    }
  }
}

export async function findAndRemoveCategoryDuplicate(req: any, res: any) {
  const filters = await CategoryModel.aggregate([
    {
      $group: {
        _id: { name: "$slug" },
        count: { $sum: 1 },
        ids: { $push: "$_id" },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);
  for (const doc of filters) {
    doc.ids.shift();
    const idsToDelete = doc.ids;
    await CategoryModel.deleteMany({ _id: { $in: idsToDelete } });
  }
  return res.json({
    message: "Deleted all category duplicated",
    result: "OK",
  });
}

export async function findAndRemoveCountryDuplicate(req: any, res: any) {
  const filters = await CountryModel.aggregate([
    {
      $group: {
        _id: { name: "$slug" },
        count: { $sum: 1 },
        ids: { $push: "$_id" },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);
  for (const doc of filters) {
    doc.ids.shift();
    const idsToDelete = doc.ids;
    await CountryModel.deleteMany({ _id: { $in: idsToDelete } });
  }
  return res.json({
    message: "Deleted all country duplicated",
    result: "OK",
  });
}

export async function findAndRemoveQualityDuplicate(req: any, res: any) {
  const filters = await CountryModel.aggregate([
    {
      $group: {
        _id: { name: "$name" },
        count: { $sum: 1 },
        ids: { $push: "$_id" },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);
  for (const doc of filters) {
    doc.ids.shift();
    const idsToDelete = doc.ids;
    await CountryModel.deleteMany({ _id: { $in: idsToDelete } });
  }
  return res.json({
    message: "Deleted all qualities duplicated",
    result: "OK",
  });
}

export async function CreateFilm(req: any, res: any) {
  try {
    const thumbnail = req.urlImage;

    const title = req.body.title;
    const secondary_title = req.body.secondary_title ?? "";
    const server = req.body.server;
    const duration = req.body.duration ?? "";
    const description = req.body.description;
    const poster = req.body.poster ?? "";
    const category = JSON.parse(req.body.category);
    const year_release = req.body.year_release;
    const total_episode =
      isEmpty(req.body.total_episode) || +req.body.total_episode <= 1
        ? "Tập FULL"
        : req.body.total_episode;
    const list_episode = req.body.list_episode;
    const language = JSON.parse(req.body.language);
    //  category.forEach((e: any) =>{
    //   console.log(e: any)
    //  })
    const country = JSON.parse(req.body.country) ?? [];
    const quality = req.body.quality;
    // return console.log("eeewewew", quality)
    /* Check exist quality, country, category */
    await checkAndAddCountries(country);
    // await checkAndAddQualities(quality);
    await checkAndAddCategories(category);
    /* Check exist quality, country */
    const director =
      req.body.director
        .replace(" ", "")
        .split(",")
        .map((e: string) => e.trim()) ?? [];
    const performer =
      req.body.performer
        .replace(" ", "")
        .split(",")
        .map((e: string) => e.trim()) ?? [];
    const slug = `${convertToSlug(title)}-${generateString(10)}`;

    const episode_tmp = (list_episode as string)
      .trim()
      .replace(" ", "")
      .split("\n")
      .map((e: any) => e.split("|"))
      .map((v) => ({ title: v[0], link: v[1] }));
    const format_episode = {
      name: server ?? "Server #1",
      list_link: episode_tmp,
    };
    const data = new FilmModel({
      title: title,
      secondary_title: secondary_title,
      description: description,
      duration: duration,
      thumbnail: thumbnail,
      poster: poster,
      category: category,
      year_release: year_release,
      total_episode: total_episode,
      // list_episode: episode_tmp,
      list_episode: format_episode,
      language: language,
      country: country,
      quality: quality,
      director: director,
      performer: performer,
      slug: slug,
      outstanding: req.body.outstanding,
    });
    const saved = await data.save();
    return res.json({
      result: saved,
    });
  } catch (error: any) {
    return res.json({
      message: `Internal Error Server: ${error}`,
      result: null,
    });
  }
}

export async function DeleteFilmBySlug(req: any, res: any) {
  try {
    const slug = req.body.slug;
    const result = await FilmModel.findOne({ slug: slug });
    if (!result) {
      return res.json({
        message: "Film not found",
        status: 404,
        result: false,
      });
    }
    result.isDeleted = true;
    await result.save();
    return res.status(200).json({
      message: "Deleted",
      status: 200,
      result: true,
    });
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      status: 500,
      result: false,
    });
  }
}

export async function UpdateFilm(req: any, res: any) {
  try {
    const new_thumbnail = req.urlImage;
    const bodyData = req.body;
    const server = bodyData.server; //format: server1,server2,...
    const episode_tmp = bodyData.list_episode
      .trim()
      .replace(" ", "")
      .split("\n")
      .map((e: any) => e.split("|"))
      .map((v: any) => ({ title: v[0], link: v[1] }));
    const format_episode = {
      name: server ?? "Server #1",
      list_link: episode_tmp,
    };

    const data = {
      title: bodyData.title,
      secondary_title: bodyData.secondary_title ?? "",
      server: bodyData.server,
      duration: bodyData.duration ?? "",
      description: bodyData.description,
      poster: bodyData.poster ?? "",
      category: JSON.parse(bodyData.category),
      year_release: bodyData.year_release,
      thumbnail: new_thumbnail ?? bodyData.thumbnail,
      total_episode:
        isEmpty(req.body.total_episode) || +req.body.total_episode <= 1
          ? "Tập FULL"
          : req.body.total_episode,

      language: JSON.parse(req.body.language),
      //  category.forEach((e: any):>{
      //   console.log(e: any)
      //  })
      country: JSON.parse(req.body.country) ?? [],
      quality: req.body.quality,
      director:
        req.body.director
          .replace(" ", "")
          .split(",")
          .map((e: string) => e.trim()) ?? [],
      performer:
        req.body.performer
          .replace(" ", "")
          .split(",")
          .map((e: string) => e.trim()) ?? [],
      slug: `${convertToSlug(bodyData.title)}-${generateString(10)}`,
      list_episode: bodyData.list_episode
        .trim()
        .replace(" ", "")
        .split("\n")
        .map((e: any) => e.split("|"))
        .map((v: any) => ({ title: v[0], link: v[1] })),
      format_episode: {
        name: server ?? "Server #1",
        list_link: episode_tmp,
      },
    };
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      code: 500,
      result: null,
    });
  }
}

export async function getAllFilm(req: any, res: any) {
  try {
    const category = req.body.category;
    const country = req.body.country;
    const keyword = req.body.keyword;
    const format = req.body.format;
    const date = req.body.date;

    const filters: any = {};
    if (!isEmpty(category)) {
      filters["category"] = { $in: category };
    }
    if (!isEmpty(country)) {
      filters["country"] = { $in: country };
    }

    if (!isEmpty(format)) {
      if (format.accept) {
        if (format.accept === "trailer") {
          filters["quality"] = "Trailer";
        } else if (format.accept === "chieu-rap") {
          filters["category"] = { $in: ["Phim Chiếu Rạp"] };
        } else if (format.accept === "phim-le") {
          filters["total_episode"] = "Tập FULL";
        } else {
          filters["total_episode"] = { $ne: "Tập FULL" };
        }
      }
      if (format.reject) {
        if (format.reject === "trailer") {
          filters["quality"] = { $ne: "Trailer" };
        } else if (format.reject === "chieu-rap") {
          filters["category"] = { $nin: ["Phim Chiếu Rạp"] };
        } else if (format.reject === "phim-le") {
          filters["total_episode"] = { $ne: "Tập FULL" };
        } else {
          filters["total_episode"] = "Tập FULL";
        }
      }
    }

    const limit = Number.isNaN(+req.body.limit) ? 20 : +req.body.limit; // Số lượng phần tử trên mỗi trang
    const page = Number.isNaN(+req.body.page) ? 1 : +req.body.page; // Trang hiện tại
    const skip = (page - 1) * limit; // Số lượng phần tử cần bỏ qua
    let count_result = 0;
    let result = [];

    // console.log("paggeee >>.", page)
    // console.log("filters get all >> ", filters)

    if (!isEmpty(keyword)) {
      count_result = await FilmModel.find({
        ...filters,
        $or: [
          { title: { $regex: keyword, $options: "i" } }, // 'i' Tuỳ chọn đối sánh không phân biệt chữ hoa, chữ thường
          { content: { $regex: keyword, $options: "i" } },
        ],
      }).countDocuments();
      result = await FilmModel.find({
        ...filters,
        $or: [
          { title: { $regex: keyword, $options: "i" } }, // 'i' Tuỳ chọn đối sánh không phân biệt chữ hoa, chữ thường
          { content: { $regex: keyword, $options: "i" } },
        ],
      })
        .sort({
          updatedAt: -1,
        })
        .limit(limit)
        .skip(skip)
        .lean();
    } else {
      count_result = await FilmModel.find({ ...filters }).countDocuments();
      result = await FilmModel.find({ ...filters })
        .sort({
          updatedAt: -1,
        })
        .limit(limit)
        .skip(skip)
        .lean();
    }

    return res.json({
      message: "Get data success",
      result: result,
      totalPages: Math.ceil(count_result / limit),
      currentPage: page,
      totalResults: count_result,
    });
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: [],
      totalPages: 0,
      currentPage: 0,
      totalResults: 0,
    });
  }
}

export async function AdminGetAllFilmMatchAllFilter(req: any, res: any) {
  try {
    const category = req.body.category;
    const country = req.body.country;
    const limit = +req.body.limit || 20; // Số lượng phần tử trên mỗi trang
    const page = +req.body.page || 1; // Trang hiện tại
    const skip = (page - 1) * limit; // Số lượng phần tử cần bỏ qua
    let count_result = 0;
    let result = [];
    const filters: any = {};
    if (!isEmpty(category)) {
      filters["category"] = { $all: category };
    }
    if (!isEmpty(country)) {
      filters["country"] = { $all: country };
    }
    count_result = await FilmModel.find({ ...filters }).countDocuments();
    result = await FilmModel.find({ ...filters })

      .sort({
        updatedAt: -1,
      })
      .limit(limit)
      .skip(skip);

    return res.json({
      message: "Success",
      result: result,
      totalPages: Math.ceil(count_result / limit),
      currenPage: page,
      totalResult: count_result,
    });
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: [],
      totalPages: 0,
      currentPage: 0,
      totalResult: 0,
    });
  }
}

export async function searchFilmByKeywords(req: any, res: any) {
  try {
    const keyword = req.query.keywords;
    const category = req.query.category;
    const limit = parseInt(req.query.limit) || 10; // Số lượng phần tử trên mỗi trang
    const page = parseInt(req.query.page) || 1; // Trang hiện tại
    const skip = (page - 1) * limit; // Số lượng phần tử cần bỏ qua

    // Tìm các bài đăng khớp với tiêu đề hoặc nội dung bằng cách sử dụng $regex để khớp một phần
    let ress = 0;
    if (category) {
      ress = await FilmModel.find({
        category: category,
        $or: [
          { title: { $regex: keyword, $options: "i" } }, // 'i' Tuỳ chọn đối sánh không phân biệt chữ hoa, chữ thường
          { content: { $regex: keyword, $options: "i" } },
        ],
        isDeleted: false,
      }).countDocuments();
    } else {
      ress = await FilmModel.find({
        $or: [
          { title: { $regex: keyword, $options: "i" } }, // 'i' Tuỳ chọn đối sánh không phân biệt chữ hoa, chữ thường
          { content: { $regex: keyword, $options: "i" } },
        ],
        isDeleted: false,
      }).countDocuments();
    }

    const totalItems = ress; // Tổng số phần tử của tìm kiếm
    const totalPages = Math.ceil(totalItems / limit); // Tổng số trang

    let data = [];
    if (category) {
      data = await FilmModel.find({
        category: category,
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { secondary_title: { $regex: keyword, $options: "i" } },
        ],
        isDeleted: false,
      })
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 });
    } else {
      data = await FilmModel.find({
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { secondary_title: { $regex: keyword, $options: "i" } },
        ],
        isDeleted: false,
      })
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 });
    }
    if (isEmpty(data))
      return res.status(200).json({
        message: "OK",
        status: 200,
        result: [],
        totalPages: 0,
        currentPage: 1,
      });
    const ressData = data.map((e: any) => ({
      title: e.title,
      description: e.description,
      thumbnail: e.thumbnail,
      slug: e.slug,
      cate: e.category,
    }));
    return res.status(200).json({
      message: "OK",
      status: 200,
      result: ressData,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: [],
    });
  }
}

export async function getAllCategory(req: any, res: any) {
  await invalidateCache(req.originalUrl);
  const list = await CategoryModel.find({}).sort({ name: 1 });
  if (!list)
    return res.json({
      list: [],
    });
  const dataFormatted = list.map((e: any) => ({
    name: e.name,
    slug: e.slug,
    isDeleted: e.isDeleted,
  }));
  await client.set(
    req.originalUrl,
    JSON.stringify({ list: dataFormatted }),
    "EX",
    946080000
  );
  return res.json({
    list: dataFormatted,
  });
}

export async function getAllCategoryClient(req: any, res: any) {
  await invalidateCache(req.originalUrl);
  const list = await CategoryModel.find({ isDeleted: false }).sort({ name: 1 });
  if (!list)
    return res.json({
      list: [],
    });
  const dataFormatted = list.map((e: any) => ({
    name: e.name,
    slug: e.slug,
    isDeleted: e.isDeleted,
  }));
  await client.set(
    req.originalUrl,
    JSON.stringify({ list: dataFormatted }),
    "EX",
    946080000
  );

  return res.json({
    list: dataFormatted,
  });
}

export async function getAllCountry(req: any, res: any) {
  await invalidateCache(req.originalUrl);
  const data = await CountryModel.find({ isDeleted: false }).sort({ name: 1 });
  if (data) {
    const tmp = data.map((e: any) => ({
      name: e.name,
      slug: e.slug,
      isDeleted: e.isDeleted,
    }));
    await client.set(
      req.originalUrl,
      // 946080000,
      JSON.stringify({ listCountry: tmp }),
      "EX",
      946080000
    );
    return res.json({
      listCountry: tmp,
    });
  } else {
    return res.json({
      listCountry: [],
    });
  }
}

export async function getAllLanguage(req: any, res: any) {
  await invalidateCache(req.originalUrl);
  const data = await LanguageModel.find({ isDeleted: false }).sort({ name: 1 });
  if (data) {
    const tmp = data.map((e: any) => ({
      name: e.name,
      isDeleted: e.isDeleted,
    }));
    await client.set(
      req.originalUrl,
      // 946080000,
      JSON.stringify({ listLanguage: tmp }),
      "EX",
      946080000
    );
    return res.json({
      listLanguage: tmp,
    });
  } else {
    return res.json({
      listLanguage: [],
    });
  }
}

// export async function getComments(req: any, res: any) {
//   try {
//     const { limit, slug, page } = req.body;

//     const filmData = await film.findOne({ slug: slug });
//     if (!filmData)
//       return res.json({
//         message: "Film dose not exist",
//         result: [],
//         totalPages: 0,
//         page: 1,
//       });

//       const pageSize = +limit ?? 10;
//       const currentPage = +page ?? 1;
//       const startIdx = (currentPage - 1) * pageSize;
//       const endIdx = startIdx + pageSize;
//       const comments = filmData.comments?.sort({updatedAt: -1})
//       const totalItems = comments?.length ?? 0
//       const paginatedComments = comments?.slice(startIdx, endIdx);
//       const totalPages = Math.ceil(totalItems / pageSize);

//       return res.status(200).json({
//         message: "Success get data comment",
//         totalItems, totalPages,
//         page: currentPage,
//         result: paginatedComments
//       })

//   } catch (error: any) {
//     return res.json({
//       result: [],
//       message: `Internal Server Error: ${error?.message ?? error}`,
//       totalPages: 0,
//       page: 1,
//     });
//   }
// }

export async function getComments(req: any, res: any) {
  try {
    const { limit, slug, page } = req.body;

    const filmData = await FilmModel.findOne({ slug: slug }).sort({
      "comments.updatedAt": -1,
    });

    if (!filmData) {
      return res.json({
        message: "Film does not exist",
        result: [],
        totalPages: 0,
        page: 1,
      });
    }

    const pageSize = +limit || 10;
    const currentPage = +page || 1;
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;

    const comments = filmData.comments?.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
    const totalItems = comments?.length ?? 0;
    const paginatedComments = comments?.slice(startIdx, endIdx);
    const totalPages = Math.ceil(totalItems / pageSize);

    return res.status(200).json({
      message: "Success get data comment",
      totalItems,
      totalPages,
      page: currentPage,
      result: paginatedComments,
    });
  } catch (error: any) {
    return res.json({
      result: [],
      message: `Internal Server Error: ${error?.message ?? error}`,
      totalPages: 0,
      page: 1,
    });
  }
}

export async function getAllQuality(req: any, res: any) {
  await invalidateCache(req.originalUrl);
  const data = await QualityModel.find({ isDeleted: false })
    .sort({ name: 1 })
    .lean();
  if (data) {
    const tmp = data.map((e: any) => ({
      name: e.name,
    }));
    await client.set(
      req.originalUrl,
      // 946080000,
      JSON.stringify({ listQuality: tmp }),
      "EX",
      946080000
    );
    return res.json({
      listQuality: tmp,
    });
  } else {
    return res.json({
      listQuality: [],
    });
  }
}

export async function getFilmByCategory(req: any, res: any) {
  //OK
  // tìm kiếm 1 số lượng bản ghi mới nhất của 1 loại
  try {
    const { num, category } = req.query;

    await FilmModel.find({ category: category, isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(num)
      .lean()
      .then((value: any) => {
        if (isEmpty(value)) return res.json({ message: "Success", result: [] });
        const ressData = value.map((e: any) => ({
          title: e.title,
          description: e.description,
          thumbnail: e.thumbnail,
          slug: e.slug,
          cate: e.category,
        }));
        res.json({ message: "Success", result: ressData });
      })
      .catch((error: any) => {
        return res.json({ message: error?.message ?? error, result: [] });
      });
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: [],
    });
  }
}

export async function getFilmByCountry(req: any, res: any) {
  try {
    const { num, country } = req.query;
    const limit = num ?? 10;
    await FilmModel.find({ country: country, isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean()
      .then((value: any) => {
        if (isEmpty(value)) return res.json({ message: "Success", result: [] });
        const ressData = value.map((e: any) => ({
          title: e.title,
          description: e.description,
          thumbnail: e.thumbnail,
          slug: e.slug,
          cate: e.category,
        }));
        res.json({ message: "Success", result: ressData });
      })
      .catch((error: any) => {
        return res.json({ message: error?.message ?? error, result: [] });
      });
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: [],
    });
  }
}

export async function getFilmByYearRelease(req: any, res: any) {
  try {
    const { num, year } = req.query;
    const limit = num ?? 10;
    await FilmModel.find({ year_release: year, isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean()
      .then((value: any) => {
        if (isEmpty(value)) return res.json({ message: "Success", result: [] });
        const ressData = value.map((e: any) => ({
          title: e.title,
          description: e.description,
          thumbnail: e.thumbnail,
          slug: e.slug,
          cate: e.category,
        }));
        return res.json({ message: "Success", result: ressData });
      })
      .catch((error: any) => {
        return res.json({ message: error?.message ?? error, result: [] });
      });
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: [],
    });
  }
}

export async function incrementView(req: any, res: any) {
  try {
    const name = req.body.name;
    const ress = await FilmModel.findOneAndUpdate(
      { title: name },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (ress) {
      return res.status(200).json({
        message: "OK",
        item: ress,
      });
    }
    return res.json({
      message: "Film was not found",
    });
  } catch (error: any) {
    return res.json({
      message: "Server Error: " + error,
    });
  }
}

export async function getFilmBySlug(req: any, res: any) {
  try {
    const _slug = req.body.slug;
    const typeShow = req.body.type;
    const ress = await FilmModel.findOne({
      slug: _slug,
      isDeleted: false,
    }).lean();

    if (!ress) {
      return res.json({
        item: null,
        error: "The film doesn't exist",
        code: 404,
      });
    }
    let currentEp = 0;
    if (
      ress?.list_episode[0]?.list_link?.length > 0 &&
      !isEmpty(ress?.list_episode[0]?.list_link[0].link)
    ) {
      currentEp = ress?.list_episode[0]?.list_link.filter(
        (e) => !isEmpty(e.link)
      ).length;
    }
    if (typeShow === "short") {
      const dataResponse = {
        title: ress.title,
        description: ress.description,
        secondary_title: ress.secondary_title,
        countries: ress.country,
        categories: ress.category,
        total_episode: ress.total_episode,
        current_episode: currentEp,
        first_episode: ress.list_episode[0]?.list_link[0],
        // list_episode: ress.list_episode,
        director: ress.director,
        duration: ress.duration,
        language: ress.language,
        performer: ress.performer,
        quality: ress.quality,
        year_release: ress.year_release,
        rate: ress.rate,
        slug: ress.slug,
        views: ress.views,
        thumbnail: ress.thumbnail,
        outstanding: ress.outstanding,
        trailer_url: ress.trailer_url,
        keywords: ress.keywords,
      };
      return res.json({ item: dataResponse });
    } else {
      const listEp = ress.list_episode.map((e) => ({
        name: e.name,
        list_link: e.list_link.map((v) => ({
          title: v.title,
          link: v.link,
          slug: v.slug,
        })),
      }));
      const { list_episode, ...rest } = ress;

      return res.json({ item: { ...rest, list_episode: listEp } });
    }
  } catch (error: any) {
    return res.json({
      item: null,
      error: `Internal Server Error: ${error?.message ?? error}`,
      code: 500,
    });
  }
}

export async function getFilmByFilter_old(req: any, res: any) {
  try {
    const limit = Number.isNaN(+req.body.limit) ? 20 : +req.body.limit; // Số lượng phần tử trên mỗi trang
    // console.log("eeee", req.body.page);
    const { filters } = req.body;
    console.log("Filterss: ", filters);
    const {
      type,
      category,
      country,
      quality,
      keyword,
      status,
      director,
      performer,
      page,
    } = filters;

    let current_page = 1;
    // Trang hiện tại
    if (req.body.page) {
      if (Number.isNaN(+req.body.page)) {
        current_page = 1;
      } else {
        current_page = +req.body.page;
      }
    } else {
      if (page) {
        if (Number.isNaN(+page)) {
          current_page = 1;
        } else {
          current_page = +page;
        }
      }
    }

    const filtersFormatted: any = {};

    // if (!isEmpty(category)) {
    //   if (typeof category === "object") {
    //     filtersFormatted["category"] = category;
    //   } else {
    //     const data = await CategoryModel.findOne({
    //       $or: [
    //         { name: { $regex: category }, $options: "i" },
    //         { slug: category },
    //       ],
    //     });
    //     if (data) {
    //       const cate = data.name.trim()
    //       filtersFormatted["category"] = { $in: [cate] };
    //     }
    //   }
    // }

    if (!isEmpty(category)) {
      if (typeof category === "object") {
        if (Array.isArray(category)) {
          console.log("Category is array");
          const existOnDB = [];
          for (const cate of category) {
            const data = await CategoryModel.findOne({
              $or: [
                { name: { $regex: new RegExp(cate.trim(), "i") } },
                { slug: category },
              ],
            });
            if (data) {
              existOnDB.push(data.name.trim());
            }
          }
          if (existOnDB.length > 0) {
            console.log(
              "Category in DB matching: ",
              existOnDB.length,
              existOnDB
            );
            filtersFormatted["category"] = { $in: existOnDB };
          }
        } else {
          console.log("Category is object but not array: ", category);
          filtersFormatted["category"] = category;
        }
      } else {
        const data = await CategoryModel.findOne({
          $or: [
            { name: { $regex: new RegExp(category, "i") } },
            { slug: category },
          ],
        });
        if (data) {
          const cate = data.name.trim();
          filtersFormatted["category"] = { $in: [cate] };
        }
      }
    }

    if (!isEmpty(status)) {
      filtersFormatted[""];
    }

    if (!isEmpty(performer)) {
      filtersFormatted["performer"] = {
        $in: Array.isArray(performer)
          ? performer.map((e: string) => e.trim())
          : [performer.trim()],
      };
    }
    if (!isEmpty(director)) {
      filtersFormatted["director"] = {
        $in: Array.isArray(director)
          ? director.map((e: string) => e.trim())
          : [director.trim()],
      };
    }

    if (!isEmpty(quality)) {
      // console.log("qualityy >> ", quality);
      if (typeof quality == "object") {
        filtersFormatted["quality"] = quality;
      } else {
        const data = await QualityModel.findOne({
          $or: [
            { name: quality.trim() }, // 'i' Tuỳ chọn đối sánh không phân biệt chữ hoa, chữ thường
            { slug: quality.trim() },
          ],
        });
        // console.log("quality >>", quality);
        if (data) {
          filtersFormatted["quality"] = data.name.trim();
        }
      }
    }
    if (!isEmpty(country)) {
      const data = await CountryModel.findOne({
        $or: [
          { name: { $regex: new RegExp(country.trim()), $options: "i" } },
          { slug: country },
        ],
      });
      if (data) {
        filtersFormatted["country"] = { $in: [data.name.trim()] };
      }
    }

    if (type) {
      if (type === "phim-chieu-rap") {
        // Bắt buộc category phải chứa "Phim chiếu rạp"
        if (filtersFormatted["category"]) {
          filtersFormatted["category"]["$in"].push("Phim Chiếu Rạp");
        } else {
          // Nếu filtersFormatted["category"] chưa tồn tại, tạo mới với "Phim chiếu rạp"
          filtersFormatted["category"] = { $in: ["Phim Chiếu Rạp"] };
        }
      } else {
        // Xử lý cho các trường hợp khác
        if (type === "phim-le") {
          filtersFormatted["total_episode"] = {
            $in: ["Tập FULL", "1", 1],
          };
        } else {
          filtersFormatted["total_episode"] = { $nin: ["Tập FULL", "1", 1] };
        }
      }
    }
    console.log(
      "filters request >>> ",
      "current page: ",
      current_page,
      "filter: ",
      filters,
      keyword,
      "total episode: ",
      filtersFormatted["total_episode"]
    );
    if (!keyword) {
      if (isEmpty(filtersFormatted)) {
        return res.json({
          message: "Not found",
          result: [],
        });
      }
      const totalItems = await FilmModel.find({
        ...filtersFormatted,
        isDeleted: false,
      }).countDocuments(); // Tổng số phần tử của thể loại bài viết
      const totalPages = Math.ceil(totalItems / limit); // Tổng số trang

      const skip = (current_page - 1) * limit; // Số lượng phần tử cần bỏ qua

      const data = await FilmModel.find({
        ...filtersFormatted,
        isDeleted: false,
      })
        .select([
          "title",
          "secondary_title",
          "thumbnail",
          "views",
          "slug",
          "quality",
          "total_episode",
          "list_episode",
          "outstanding",
          "poster",
          "rate",
        ])
        .skip(skip)
        .limit(limit)
        .sort({ year_release: -1 })
        .lean(); // Lấy dữ liệu từ MongoDB, sắp xếp giảm dần theo ngày đăng
      const ress = data.map((value) => {
        const currentEp = !isEmpty(value?.list_episode)
          ? value?.list_episode[0]?.list_link?.length
          : 0;
        const {
          title,
          secondary_title,
          thumbnail,
          views,
          slug,
          quality,
          total_episode,
          outstanding,
          poster,
          rate,
        } = value;
        return {
          title,
          secondary_title,
          thumbnail,
          views,
          slug,
          quality,
          total_episode,
          current_episode: currentEp,
          outstanding,
          poster,
          rate,
        };
      });
      return res.json({
        result: ress,
        totalItems,
        totalPages,
        currentPage: current_page,
      });
    } else {
      console.log("filter formatted have keyword: ", filtersFormatted);
      const totalItems = await FilmModel.find({
        ...filtersFormatted,
        $or: [
          { keywords: { $regex: new RegExp(keyword), $options: "i" } }, // 'i' Tuỳ chọn đối sánh không phân biệt chữ hoa, chữ thường
          // { secondary_title: { $regex: keyword, $options: "i" } },
          // { description: { $regex: keyword, $options: "i" } },
        ],
        isDeleted: false,
      }).countDocuments(); // Tổng số phần tử của thể loại bài viết
      const totalPages = Math.ceil(totalItems / limit); // Tổng số trang

      const skip = (current_page - 1) * limit; // Số lượng phần tử cần bỏ qua

      const data = await FilmModel.find({
        ...filtersFormatted,
        $or: [
          { keywords: { $regex: new RegExp(keyword), $options: "i" } }, // 'i' Tuỳ chọn đối sánh không phân biệt chữ hoa, chữ thường
          // { secondary_title: { $regex: keyword, $options: "i" } },
          // { description: { $regex: keyword, $options: "i" } },
        ],
        isDeleted: false,
      })
        .select([
          "title",
          "secondary_title",
          "thumbnail",
          "views",
          "slug",
          "quality",
          "total_episode",
          "list_episode",
          "outstanding",
          "poster",
          "rate",
        ])
        .skip(skip)
        .limit(limit)
        .sort({ year_release: -1 })
        .lean(); // Lấy dữ liệu từ MongoDB, sắp xếp giảm dần theo ngày update

      const ress = data.map((value) => {
        const currentEp = value?.list_episode[0]?.list_link?.length ?? 0;
        const {
          title,
          secondary_title,
          thumbnail,
          views,
          slug,
          quality,
          total_episode,
          outstanding,
          poster,
          rate,
        } = value;
        return {
          title,
          secondary_title,
          thumbnail,
          views,
          slug,
          quality,
          total_episode,
          current_episode: currentEp,
          outstanding,
          poster,
          rate,
        };
      });
      return res.json({
        result: ress,
        totalItems,
        totalPages,
        currentPage: current_page,
      });
    }
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: [],
    });
  }
}

/* Film filter with aggregation pipeline */
export async function getFilmByFilter(req: any, res: any) {
  try {
    const limit = Number.isNaN(+req.body.limit) ? 20 : +req.body.limit;
    const { filters } = req.body;
    const {
      type,
      category,
      country,
      quality,
      keyword,
      status,
      director,
      performer,
      page,
    } = filters;

    console.log("Filter received >> ", filters);

    let current_page = 1;
    if (req.body.page) {
      current_page = Number.isNaN(+req.body.page) ? 1 : +req.body.page;
    } else if (page) {
      current_page = Number.isNaN(+page) ? 1 : +page;
    }

    let filtersFormatted: any = {};

    if (!isEmpty(category)) {
      if (typeof category === "object") {
        if (Array.isArray(category)) {
          const categories = await Promise.all(
            category.map(async (cate) => {
              const data = await CategoryModel.findOne({
                $or: [
                  { name: { $regex: new RegExp(cate.trim(), "i") } },
                  { slug: cate },
                ],
              }).lean();
              return data ? data.name.trim() : null;
            })
          );
          filtersFormatted["category"] = { $in: categories.filter(Boolean) };
        } else {
          filtersFormatted["category"] = category;
        }
      } else {
        const data = await CategoryModel.findOne({
          $or: [
            { name: { $regex: new RegExp(category, "i") } },
            { slug: category },
          ],
        });
        if (data) {
          filtersFormatted["category"] = { $in: [data.name.trim()] };
        }
      }
    }

    if (!isEmpty(performer)) {
      filtersFormatted["performer"] = {
        $in: Array.isArray(performer)
          ? performer.map((e: string) => e.trim())
          : [performer.trim()],
      };
    }

    if (!isEmpty(director)) {
      filtersFormatted["director"] = {
        $in: Array.isArray(director)
          ? director.map((e: string) => e.trim())
          : [director.trim()],
      };
    }

    if (!isEmpty(quality)) {
      if (typeof quality === "object") {
        filtersFormatted["quality"] = quality;
      } else {
        const data = await QualityModel.findOne({
          $or: [{ name: quality.trim() }, { slug: quality.trim() }],
        });
        if (data) {
          filtersFormatted["quality"] = data.name.trim();
        }
      }
    }

    if (!isEmpty(country)) {
      const data = await CountryModel.findOne({
        $or: [
          { name: { $regex: new RegExp(country.trim()), $options: "i" } },
          { slug: country },
        ],
      });
      if (data) {
        filtersFormatted["country"] = { $in: [data.name.trim()] };
      }
    }

    if (type) {
      if (type === "phim-chieu-rap") {
        if (filtersFormatted["category"]) {
          filtersFormatted["category"]["$in"].push("Phim Chiếu Rạp");
        } else {
          filtersFormatted["category"] = { $in: ["Phim Chiếu Rạp"] };
        }
      } else {
        filtersFormatted["total_episode"] =
          type === "phim-le"
            ? { $in: ["Tập FULL", "1", 1] }
            : { $nin: ["Tập FULL", "1", 1] };
      }
    }

    const skip = (current_page - 1) * limit;

    const matchStage: any = {
      ...filtersFormatted,
      isDeleted: false,
    };
    console.log("Match stage >> ", matchStage);
    if (keyword) {
      matchStage.$or = [
        { keywords: { $regex: new RegExp(keyword), $options: "i" } },
      ];
    }

    const aggregationPipeline = [
      { $match: matchStage },
      {
        $facet: {
          totalItems: [{ $count: "count" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            { $sort: { updatedAt: -1, year_release: -1 } },
            {
              $project: {
                title: 1,
                secondary_title: 1,
                thumbnail: 1,
                views: 1,
                slug: 1,
                quality: 1,
                total_episode: 1,
                list_episode: 1,
                outstanding: 1,
                poster: 1,
                rate: 1,
                current_episode: {
                  $cond: {
                    if: { $gt: [{ $size: "$list_episode" }, 0] },
                    then: {
                      $size: { $arrayElemAt: ["$list_episode.list_link", 0] },
                    },
                    else: 0,
                  },
                },
              },
            },
          ],
        },
      },
    ];

    const result = await FilmModel.aggregate(aggregationPipeline as any).sort({
      year_release: -1,
    });

    const totalItems = result[0].totalItems[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const data = result[0].data;

    res.json({
      result: data,
      totalItems,
      totalPages,
      currentPage: current_page,
    });
  } catch (error: any) {
    res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: [],
    });
  }
}

export async function getCommingSoonFilm(req: any, res: any) {
  try {
    const limit = req.body.limit ? parseInt(req.body.limit) : 10;
    const data = await FilmModel.find({
      $and: [{ quality: "Trailer" }, { "list_episode.0.list_link.0.link": "" }],
    })
      .limit(limit)
      .sort({ year_release: -1 })
      .lean();
    return res.json({
      message: "Get data comming soon successfully",
      result: data,
    });
  } catch (error: any) {
    return res.json({
      message: "Get comming soon film error",
      result: [],
    });
  }
}

export async function getHighRateFilm(req: any, res: any) {
  try {
    const films = await FilmModel.aggregate([
      { $unwind: "$rate" },
      { $group: { _id: "$_id", avgRating: { $avg: "$rate.star_number" } } },
      {
        $lookup: {
          from: "films",
          localField: "_id",
          foreignField: "_id",
          as: "film",
        },
      },
      { $unwind: "$film" },
      { $sort: { avgRating: -1 } },
      { $limit: 10 },
      {
        $project: {
          title: "$film.title",
          secondary_title: "$film.secondary_title",
          views: "$film.views",
          slug: "$film.slug",
          thumbnail: "$film.thumbnail",
          category: "$film.category",
          quality: "$film.quality",
          avgRating: 1,
        },
      },
    ]).sort({ updatedAt: -1, year_release: -1 });

    return res.json({
      result: films,
      totalResults: films.length,
      limit: 10,
    });
  } catch (err) {
    return res.json({
      result: [],
      totalResults: 0,
      limit: 10,
    });
  }
}

export async function getCompletedFilmFilter(req: any, res: any) {
  try {
    const dataR = await FilmModel.aggregate([
      {
        $match: {
          quality: { $ne: "Trailer" },
          $or: [
            { total_episode: "Tập FULL" },
            {
              total_episode: { $regex: /^[0-9]+$/ },
              $expr: {
                $gte: [
                  "$list_episode.0.list_link.length",
                  { $toInt: "$total_episode" },
                ],
              },
            },
          ],
        },
      },
      {
        $addFields: {
          current_episode: {
            $size: "$list_episode.0.list_link",
          },
        },
      },
      {
        $project: {
          title: 1,
          secondary_title: 1,
          thumbnail: 1,
          slug: 1,
          _id: 1,
          total_episode: 1,
          current_episode: 1,
          quality: 1,
          views: 1,
          country: 1,
          rate: 1,
          outstanding: 1,
        },
      },
    ])
      .sort({ views: -1, updatedAt: -1, year_release: -1 }) // Sắp xếp giảm dần theo views, sau đó sắp xếp giảm dần theo updatedAt
      .limit(12); // Giới hạn số lượng phim trả về

    return res.json({
      result: dataR,
    });
  } catch (error: any) {
    return res.json({
      error: `Error filtering completed movies: ${error?.message}`,
    });
    throw new Error(`Error filtering completed movies: ${error?.message}`);
  }
}

export async function filterCompletedMovies(req: any, res: any) {
  try {
    const totalEpisodeDouble = { $toDouble: "$total_episode", onError: 0 };
    const result = await FilmModel.aggregate([
      {
        $match: {
          quality: { $ne: "Trailer" },
          total_episode: { $ne: "?" }, // Loại bỏ các phim có total_episode là "?"
        },
      },
      {
        $match: {
          $or: [
            { total_episode: "Tập FULL" },
            {
              $expr: {
                $cond: {
                  if: {
                    $or: [
                      {
                        $eq: [
                          "$total_episode",
                          { $toString: "$total_episode" },
                        ],
                      },
                      {
                        $eq: [
                          "$total_episode",
                          { $toDouble: "$total_episode", onError: 0 },
                        ],
                      },
                    ],
                  },
                  then: {
                    $gte: [
                      { $size: { $ifNull: ["$list_episode.0.list_link", []] } },
                      {
                        $cond: {
                          if: { $eq: ["$total_episode", "Tập FULL"] },
                          then: 0,
                          else: { $toDouble: "$total_episode", onError: 0 },
                        },
                      },
                    ],
                  },
                  else: false,
                },
              },
            },
          ],
        },
      },
    ]).sort({ year_release: -1, updatedAt: -1 });

    return res.json(result);
  } catch (error: any) {
    return res.json({
      error: `Error filtering completed movies: ${error?.message}`,
    });
  }
}

export async function getHotPhim(req: any, res: any) {
  try {
    const topFilms = await FilmModel.find({
      $and: [{ isDeleted: false }, { quality: { $ne: "Trailer" } }],
    })
      .select([
        "title",
        "secondary_title",
        "thumbnail",
        "slug",
        "_id",
        "total_episode",
        "list_episode",
        "quality",
        "views",
        "country",
        "rate",
      ])
      .sort({ views: -1, updatedAt: -1 }) // Sắp xếp giảm dần theo views, sau đó sắp xếp giảm dần theo updatedAt
      .limit(10)
      .lean(); // Giới hạn số lượng phim trả về
    return res.status(200).json({
      result: topFilms,
      message: "Success for get data",
      code: 200,
    });
  } catch (error: any) {
    return res.json({
      message: `Internal Server Error: ${error?.message ?? error}`,
      result: [],
      status: 500,
    });
  }
}

export async function getTotalPageFromLimit(req: any, res: any) {
  try {
    const { limit } = req.query;
    const len = await FilmModel.countDocuments();
    const totalPages = Math.ceil(len / limit);
    return res.json({ result: totalPages });
  } catch (error) {
    res.json({ result: 0, message: error });
  }
}

export async function getAllSlug(req: any, res: any) {
  await invalidateCache(req.originalUrl);
  try {
    const { start, end } = req.query;
    const lstSlug = await FilmModel.find({}, "slug title updatedAt")
      .skip(start)
      .limit(parseInt(end) - parseInt(start))
      .lean();
    await client.set(
      req.originalUrl as string,
      // 86400,
      JSON.stringify({
        result: lstSlug,
        message: "Fetch all slug successfully",
      }),
      "EX",
      86400
    );
    return res.json({
      result: lstSlug,
      message: "Fetch all slug successfully",
    });
  } catch (error: any) {
    return res.json({
      result: [],
      message: "Fetch all slug was failed. See error below",
      error: error,
    });
  }
}

export async function getFilmFromListCategory(req: any, res: any) {
  try {
    const listCategory = req.body.category;
    const _title = req.body.title;
    // console.log("hehehee", _title, listCategory)
    if (isEmpty(listCategory))
      return res.json({
        result: [],
        error: "There are no movies in the genre you requested",
        code: 404,
      });
    const promises = (listCategory as []).map((e: any) =>
      FilmModel.find({
        category: e,
        isDeleted: false,
        quality: { $ne: "Trailer" },
        title: _title,
      })
        .select([
          "title",
          "secondary_title",
          "thumbnail",
          "slug",
          "_id",
          "total_episode",
          "list_episode",
          "quality",
        ])
        .limit(8)
        .sort({ updatedAt: -1, year_release: -1 })
        .lean()
    );
    const ress = await Promise.all(promises);

    const formatData = (listCategory as []).map((e, i) => ({
      name: e,
      result: ress[i].map((value) => {
        const current = value.list_episode[0].list_link.length;
        return {
          current_episode: current,
          title: value.title,
          secondary_title: value.secondary_title,
          _id: value._id,
          slug: value.slug,
          quality: value.quality,
          thumbnail: value.thumbnail,
          total_episode: value.total_episode,
          outstanding: value.outstanding,
        };
      }),
    }));

    return res.status(200).json({ result: formatData });
  } catch (error: any) {
    return res.json({
      result: null,
      error: `Internal Server Error: ${error?.message ?? error}`,
      code: 500,
    });
  }
}
