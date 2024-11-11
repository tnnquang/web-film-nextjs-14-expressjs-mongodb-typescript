import { BASE_URL_API, BASE_URL_FRONTEND } from "@/common/constant";
import { IFilm } from "@/configs/types";
import axios from "axios";
import { MetadataRoute } from "next/types";

const LIMIT_PER_SITEMAP = 7000;

export async function generateSitemaps() {
  const totalPages: number = await axios
    .get(
      `${BASE_URL_API}/film/total-page-from-limit?limit=${LIMIT_PER_SITEMAP}`,
      {
        timeout: 100000000,
      }
    )
    .then((val) => val.data.result);
  console.log(`Total pages: ${totalPages}`);
  // Fetch the total number of products and calculate the number of sitemaps needed
  return Array.from({ length: totalPages }, (v, k) => k).map((e) => ({
    id: e,
  }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  // Google's limit is 50,000 URLs per sitemap
  const start = id * LIMIT_PER_SITEMAP;
  const end = start + LIMIT_PER_SITEMAP;
  console.log(`Generating sitemap ${id} from ${start} to ${end}`);
  const films = await axios
    .get(`${BASE_URL_API}/film/all-slug?start=${start}&end=${end}`, {
      timeout: 100000000,
    })
    .then((res) => res.data.result);
  return films.map((film: IFilm) => ({
    url: `${BASE_URL_FRONTEND}/phim/${film.slug}`,
    lastModified: film.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}
