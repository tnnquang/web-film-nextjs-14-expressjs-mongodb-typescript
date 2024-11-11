import { getListCategory, getListCountry } from "@/common/utils";
import ListFilmByCategoryComponent from "@/components/FilmComponents/ListFilmByCategoryComponent";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const listCate = await getListCategory();
  return listCate.map((cate: any) => ({ slug: cate.slug }));
}

export default async function ListFilmByCategoryPage({ params }: Props) {
  const slug = params.slug;
  const [categories, countries] = await Promise.all([
    getListCategory(),
    getListCountry(),
  ]);

  return (
    <ListFilmByCategoryComponent
      slug={slug}
      listDataFilter={{
        categories,
        countries,
      }}
    />
  );
}
