import { UploadImageFilm } from "../controller/upload";
import multer from "multer";
import express from "express";
import CompressingImages from "../middleware/compress_image";
import {
  AdminGetAllFilmMatchAllFilter,
  createCategory,
  CreateFilm,
  softDeleteCategory,
  DeleteFilmBySlug,
  getAllCategory,
  getAllCountry,
  getAllFilm,
  getAllLanguage,
  getAllQuality,
  getFilmByFilter,
  getFilmBySlug,
  getFilmFromListCategory,
  getHotPhim,
  updateCategory,
  deleteCategory,
  getComments,
  getAllCategoryClient,
  findOneCountry,
  UpdateFilm,
  createQuality,

  filterCompletedMovies,
  findOneCategory,
  getHighRateFilm,
  incrementView,
  getCommingSoonFilm,
  findAndRemoveCategoryDuplicate,
  findAndRemoveCountryDuplicate,
  findAndRemoveDuplicate,
  getAllSlug,
  findAndRemoveQualityDuplicate,
  getTotalPageFromLimit,
  RestoreFilmBySlug,
} from "../controller/film";
import film from "../model/film";
// import { cacheMiddleware } from "../middleware/caching";

const router = express.Router();

const storage = multer.memoryStorage();

const parser = multer({ storage: storage });

// router.get("/search/keywords=:keywords&page=:page&limit=:limit", searchByKeywords)
// router.get("/search", searchByKeywords);

router.get("/category", getAllCategory);
router.get("/category-client", getAllCategoryClient);
router.get("/category-one", findOneCategory);
router.get("/country-one", findOneCountry);
router.get("/all-slug", getAllSlug);
router.get("/total-page-from-limit", getTotalPageFromLimit);
router.post("/category/delete", async function (req, res) {
  const { category } = req.body;
  const result = await softDeleteCategory(category);

  return res.json({
    result: result,
  });
});

router.post("/category/hard-delete", async function (req, res) {
  const { category } = req.body;
  const result = await deleteCategory(category);

  return res.json({
    result: result,
  });
});

router.post("/category/create", async function (req, res) {
  const { category } = req.body;
  const result = await createCategory(category);

  return res.json({
    result: result,
  });
});

router.post("/category/update", async function (req, res) {
  const { filters } = req.body;
  // console.log("filters >>", filters)
  const result = await updateCategory(filters);

  return res.json({
    result: result,
  });
});

router.get("/country", getAllCountry);
router.get("/quality", getAllQuality);
router.get("/language", getAllLanguage);
router.post("/film-by-slug", getFilmBySlug);
router.post("/film-filter", getFilmByFilter);
router.post("/get-all-film", getAllFilm);
router.get("/get-completed-film", filterCompletedMovies);
router.get("/get-completed-film2", async (req, res) => {
  const x = await film.findOne({ slug: "thon-tinh-bau-troi-QjGsCP0NCy" });
  return res.json({
    len: x?.list_episode[0].list_link.length,
  });
});
router.post("/admin-get-film", AdminGetAllFilmMatchAllFilter);
router.post("/film-of-list-category", getFilmFromListCategory);
router.post("/hot-film", getHotPhim);
router.post("/high-rate-film", getHighRateFilm);
router.post("/get-comment", getComments);
router.post("/delete", DeleteFilmBySlug);
router.post("/restore", RestoreFilmBySlug);
router.post("/create-quality", async (req, res) => {
  const data = req.body.qualities;
  const result = await createQuality(data);
  if (result === true) {
    return res.status(200).json({
      message: "Created data quality",
    });
  } else {
    return res.status(401).json({
      message: "Qualities is not created successful",
    });
  }
});
router.post(
  "/create",
  parser.single("thumbnail"),
  CompressingImages,
  UploadImageFilm,
  CreateFilm
);

router.post(
  "/update-data",
  parser.single("images"),
  CompressingImages,
  UploadImageFilm,
  UpdateFilm
);

router.post("/update-view", incrementView);
router.get("/delete-duplicate", findAndRemoveDuplicate);
router.get("/delete-category-duplicate", findAndRemoveCategoryDuplicate);
router.get("/delete-country-duplicate", findAndRemoveCountryDuplicate);
router.get("/delete-quality-duplicate", findAndRemoveQualityDuplicate);
router.post("/comming-soon", getCommingSoonFilm);

router.get("/sitemap-to-all", async (req, res) => {
  const data = await film
    .find({})
    .select(["title", "slug", "updatedAt", "description"]);
  return res.json({
    data,
  });
});

module.exports = router;
