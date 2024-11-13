import { BASE_URL_API, GET_FILM_BY_FILTER } from "@/common/constant";
import { getListCategory, getListCountry, retry } from "@/common/utils";
import ListFilmByCategoryComponent from "@/components/FilmComponents/ListFilmByCategoryComponent";
import ListFilmItemComponent, {
  FilmSkeletonComponent,
} from "@/components/FilmComponents/ListFilmItem";
import FiltersServerComponent from "@/components/filters/filter-server";
import { Input } from "antd";
import { isEmpty } from "lodash";
import Link from "next/link";
import { Suspense } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateStaticParams() {
  const listCate = await getListCategory();
  return listCate.map((cate: any) => ({ slug: cate.slug }));
}

export default async function ListFilmByCategoryPage({
  params,
  searchParams,
}: Props) {
  let filters: any = {};
  let totalPages = 0;
  let currentPage = 1;
  let dataFilm: { result: any; totalPages?: number; currentPage?: number } = {
    result: null,
    totalPages: 0,
    currentPage: currentPage,
  };
  const slug = params.slug;

  if (!isEmpty(searchParams)) {
    const { page, ...search } = searchParams;
    if (page) currentPage = +page || 1;
    filters = search;
  }

  async function getDataFilm(limit?: number, page?: number) {
    try {
      const ress = await fetch(`${BASE_URL_API}${GET_FILM_BY_FILTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filters: { ...filters, category: slug },
          limit: limit,
          page: page,
        }),
        next: {
          revalidate: 3600,
          tags: [
            JSON.stringify({
              filters: { ...filters, country: slug },
              limit: limit,
              page: page,
            }),
          ],
        },
      });

      if (ress.ok) {
        const data = await ress.json();

        dataFilm = data;
        totalPages = data.totalPages;
      } else {
        dataFilm = { result: [] };
        totalPages = 0;
      }
    } catch (error) {
      dataFilm = { result: [] };
      console.error("Error fetching data:", error);
    }
  }

  const [categories, countries] = await Promise.all([
    retry(getListCategory, "getListCategory()"),
    retry(getListCountry, "getListCountry()"),
    // retry(
    //   getDataFilm(undefined, currentPage),
    //   "getDataFilm(undefined, currentPage)"
    // ),
    getDataFilm(undefined, currentPage),
  ]);

  const renderBodyContent = () => {
    if (!dataFilm?.result) return null;

    return (
      <>
        <div className="data-list-film flex flex-wrap items-start gap-2">
          <Suspense fallback={<FilmSkeletonComponent />}>
            <ListFilmItemComponent listFilm={dataFilm?.result} />
          </Suspense>
        </div>
        <div className="mx-auto mt-6 flex items-center justify-center gap-2">
          {+totalPages > 1 && !isEmpty(dataFilm?.result) && (
            <>
              <Link
                href={
                  currentPage === 1
                    ? ""
                    : {
                        pathname: `/the-loai/${slug}`,
                        query: { ...filters, page: currentPage - 1 },
                      }
                }
                prefetch
                className={`flex h-10 w-10 items-center justify-center rounded-md bg-[#4660e6] text-center text-white ${currentPage === 1 ? "cursor-not-allowed bg-opacity-50" : "hover:opacity-80"}`}
                type="button"
              >
                <BsArrowLeft size={20} />
              </Link>
              <Input
                className="!disabled:bg-[#4660e6] !disabled:bg-opacity-90 h-10 !w-16 !bg-[#4660e6] text-center !text-white disabled:text-white"
                value={`${currentPage}/${totalPages}`}
                disabled
              />
              <Link
                href={
                  currentPage === totalPages
                    ? ""
                    : {
                        pathname: `/the-loai/${slug}`,
                        query: { ...filters, page: currentPage + 1 },
                      }
                }
                prefetch
                className={`flex h-10 w-10 items-center justify-center rounded-md bg-[#4660e6] text-center text-white disabled:bg-opacity-50 ${currentPage === totalPages ? "cursor-not-allowed bg-opacity-50" : "hover:opacity-80"}`}
              >
                <BsArrowRight size={20} />
              </Link>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <section className="list-film-container w-full">
      <FiltersServerComponent
        filters={filters}
        initValue={slug}
        path="the-loai"
        listData={{
          categories: categories,
          countries: countries,
        }}
      />

      {renderBodyContent()}
    </section>
  );

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
