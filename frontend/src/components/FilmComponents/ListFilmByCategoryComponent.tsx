"use client";

import { Input } from "antd";
import { isEmpty } from "lodash";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import React, { Fragment, Suspense, useEffect, useState } from "react";

import { scrollToTop } from "@/common/utils";
import axiosInstance from "@/common/axiosInstance";
import FiltersComponent from "@/components/filters/filter-client";
import { GET_FILM_BY_FILTER } from "@/common/constant";
import ListFilmItemComponent, { FilmSkeletonComponent } from "./ListFilmItem";

export default function ListFilmByCategoryComponent({
  slug,
  listDataFilter,
}: {
  slug: string | null;
  listDataFilter: any;
}) {
  const [filters, setFilters] = useState<any>({}); //thể loại
  const [dataFilm, setDataFilm] = useState<any>({
    result: null,
    totalPages: 0,
    currentPage: 1,
  });
  const [fetchingData, setFetchingData] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const getDataFilm = async (filters: any, limit?: number, page?: number) => {
    if (!filters) {
      setFetchingData(false);
      setDataFilm({ result: [] });
      return;
    }

    setFetchingData(true);
    scrollToTop();
    try {
      const ress = await axiosInstance.post(
        GET_FILM_BY_FILTER,
        { filters: { ...filters }, limit: limit, page: page },
        { headers: { "Content-Type": "application/json" } }
      );

      if (ress.status === 200) {
        setFetchingData(false);
        setDataFilm(ress.data);
        setTotalPages(ress.data.totalPages);
      } else {
        setFetchingData(false);
        setDataFilm({ result: [] });
        setTotalPages(0);
      }
    } catch (error) {
      setFetchingData(false);
      setDataFilm({ result: [] });
      setTotalPages(0);
      console.error("Error fetching data:", error);
    }
  };

  const prevPage = () => {
    if (currentPage === 1) return;
    setCurrentPage((prev) => prev - 1);
  };

  const nextPage = () => {
    if (currentPage === totalPages) return;
    setCurrentPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (!slug) return;
    const newData = { ...filters };
    newData.category = slug;
    setFilters(newData);
    getDataFilm({ category: slug });
  }, [slug]);

  useEffect(() => {
    if (!currentPage) return;
    getDataFilm({ category: slug }, undefined, currentPage);
  }, [currentPage]);

  // console.log("ListFilmByCategoryComponent >> ", dataFilm);

  const renderBodyContent = () => {
    if (!dataFilm?.result) return null;

    return (
      <Fragment>
        <div className="data-list-film flex flex-wrap items-start gap-2">
          <Suspense fallback={<FilmSkeletonComponent />}>
            <ListFilmItemComponent listFilm={dataFilm?.result} />
          </Suspense>
        </div>
        <div className="mx-auto mt-6 flex items-center justify-center gap-2">
          {+totalPages > 1 && !isEmpty(dataFilm?.result) && (
            <>
              <button
                onClick={prevPage}
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#5142FC] text-center text-white disabled:bg-opacity-50"
                type="button"
                disabled={currentPage === 1}
              >
                <BsArrowLeft size={20} />
              </button>
              <Input
                className="h-10 w-16 bg-[#5142FC] text-center text-white disabled:bg-[#5142FC] disabled:bg-opacity-90 disabled:text-white"
                value={`${currentPage}/${totalPages}`}
                disabled
              />
              <button
                onClick={nextPage}
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#5142FC] text-center text-white disabled:bg-opacity-50"
                disabled={currentPage === totalPages}
              >
                <BsArrowRight size={20} />
              </button>
            </>
          )}
        </div>
      </Fragment>
    );
  };

  return (
    <section className="list-film-container w-full">
      <FiltersComponent
        filters={filters}
        setFilters={setFilters}
        fetching={fetchingData}
        onSubmit={getDataFilm}
        initValue={slug as string}
        path="the-loai"
        listData={listDataFilter}
      />
      {renderBodyContent()}
    </section>
  );
}
