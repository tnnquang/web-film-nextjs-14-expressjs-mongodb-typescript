import ListFilmItemComponent from "./ListFilmItem";
import { BASE_URL_API, GET_FILM_BY_FILTER, fetchOrigin } from "@/common/constant";

export default async function TabFilm({ type }: { type: string }) {
  const res = await fetch(`${BASE_URL_API}${GET_FILM_BY_FILTER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...fetchOrigin},
    body: JSON.stringify({
      filters: {
        type: type,
      },
      limit: 12,
    }),
    next: { revalidate: 1800, tags: ["list-film-tab-category"] }, //1800 giây sẽ xác thực lại dữ liệu
  });
  if (res.ok) {
    const dataFilm = await res.json();
    return <ListFilmItemComponent listFilm={dataFilm?.result} />;
  } else return <ListFilmItemComponent listFilm={[]} />;
}
