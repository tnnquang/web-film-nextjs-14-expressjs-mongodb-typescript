import ListFilmByCountryComponent from "@/components/FilmComponents/ListFilmByCountryComponent";
import { getListCategory, getListCountry } from "@/common/utils";
// import ListFilmItemComponent, {
//   FilmSkeletonComponent,
// } from "@/components/FilmComponents/ListFilmItem";
// import FiltersComponent from "@/components/Filters";
// import { Input } from "antd";
// import { isEmpty } from "lodash";
// import { Suspense } from "react";
// import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
// import axiosInstance from "@/common/axiosInstance";
// import { GET_FILM_BY_FILTER } from "@/common/constant";

type Props = {
  params: { slug: string };
  // searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateStaticParams() {
  const listCountry = await getListCountry();
  return listCountry.map((cate: any) => ({ slug: cate.slug }));
}

export default async function ListFilmByCountryPage({
  params,
  // searchParams,
}: Props) {
  // let filters: any = {};
  // let fetchingData = true;
  // let totalPages = 0;
  // let dataFilm: { result: any; totalPages?: number; currentPage?: number } = {
  //   result: null,
  //   totalPages: 0,
  //   currentPage: 1,
  // };
  const slug = params.slug;
  const [categories, countries] = await Promise.all([
    getListCategory(),
    getListCountry(),
  ]);

  // if (!isEmpty(searchParams)) {
  // }

  // const getDataFilm = async (limit?: number, page?: number) => {
  //   if (!filters) {
  //     fetchingData = false;
  //     dataFilm = { result: [] };
  //     return;
  //   }

  //   try {
  //     const ress = await axiosInstance.post(
  //       GET_FILM_BY_FILTER,
  //       { filters: { ...filters }, limit: limit, page: page },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (ress.status === 200) {
  //       fetchingData = false;
  //       dataFilm = ress.data;
  //       totalPages = ress.data.totalPages;
  //     } else {
  //       fetchingData = false;
  //       dataFilm = { result: [] };
  //       totalPages = 0;
  //     }
  //   } catch (error) {
  //     fetchingData = false;
  //     dataFilm = { result: [] };
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // console.log(
  //   "categories >>",
  //   categories?.length || null,
  //   "countries >>",
  //   countries?.length || null
  // );

  // const renderBodyContent = () => {
  //   if (!dataFilm?.result) return null;

  //   return (
  //     <>
  //       <div className="data-list-film flex flex-wrap items-start gap-2">
  //         <Suspense fallback={<FilmSkeletonComponent />}>
  //           <ListFilmItemComponent listFilm={dataFilm?.result} />
  //         </Suspense>
  //       </div>
  //       <div className="mx-auto mt-6 flex items-center justify-center gap-2">
  //         {+totalPages > 1 && !isEmpty(dataFilm?.result) && (
  //           <>
  //             <button
  //               onClick={prevPage}
  //               className="flex h-10 w-10 items-center justify-center rounded-md bg-[#5142FC] text-center text-white disabled:bg-opacity-50"
  //               type="button"
  //               disabled={currentPage === 1}
  //             >
  //               <BsArrowLeft size={20} />
  //             </button>
  //             <Input
  //               className="h-10 w-16 bg-[#5142FC] text-center text-white disabled:bg-[#5142FC] disabled:bg-opacity-90 disabled:text-white"
  //               value={`${currentPage}/${totalPages}`}
  //               disabled
  //             />
  //             <button
  //               onClick={nextPage}
  //               className="flex h-10 w-10 items-center justify-center rounded-md bg-[#5142FC] text-center text-white disabled:bg-opacity-50"
  //               disabled={currentPage === totalPages}
  //             >
  //               <BsArrowRight size={20} />
  //             </button>
  //           </>
  //         )}
  //       </div>
  //     </>
  //   );
  // };
  // return null;
  // return (
  //   <section className="list-film-container w-full">
  //     <FiltersComponent
  //       filters={filters}
  //       setFilters={setFilters}
  //       fetching={fetchingData}
  //       onSubmit={getDataFilm}
  //       initValue={slug}
  //       path="quoc-gia"
  //       listData={listDataFilters}
  //     />
  //     {renderBodyContent()}
  //   </section>
  // );

  return (
    <ListFilmByCountryComponent
      slug={slug}
      listDataFilters={{ categories, countries }}
    />
  );
}
