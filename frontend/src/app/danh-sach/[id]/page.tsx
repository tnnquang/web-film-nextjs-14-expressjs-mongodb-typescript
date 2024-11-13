import FilmsByListComponent from "@/components/FilmComponents/FilmsByListComponent";
import { getListCategory, getListCountry, retry } from "@/common/utils";

type Props = {
  params: { id: string };
};

export default async function ListFilmPage({ params }: Props) {
  const id = params.id;
  const [categories, countries] = await Promise.all([
    retry(getListCategory, "getListCategory()"),
    retry(getListCountry, "getListCountry()"),
  ]);
  return (
    <FilmsByListComponent id={id} listDataFilters={{ categories, countries }} />
  );
}
