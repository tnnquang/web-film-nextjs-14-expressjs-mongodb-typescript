import {
  BASE_URL_API,
  GET_FILM_BY_FILTER,
  fetchOrigin,
} from "@/common/constant";

export const dynamic = "force-dynamic"; // defaults to auto

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tabSelected = url.searchParams.get("query");
  const data = await fetch(`${BASE_URL_API}${GET_FILM_BY_FILTER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...fetchOrigin,
    },
    body: JSON.stringify({
      filters: {
        type: tabSelected,
        quality: { $ne: "Trailer" },
        category: { $nin: ["Phim 18+", "Hoạt Hình"] },
      },
      limit: 12,
    }),
    next: { revalidate: 1800, tags: ["list-film-tab-category"] }, //1800 giây sẽ xác thực lại dữ liệu
  }).then((value) => value.json());

  return Response.json({ data });
}
