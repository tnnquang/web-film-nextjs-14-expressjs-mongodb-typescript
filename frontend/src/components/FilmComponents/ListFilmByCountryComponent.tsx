"use client";

import { isEmpty } from "lodash";
import { Input } from "antd";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import React, { Suspense, useEffect, useState } from "react";

import FiltersComponent from "../filters/filter-client";
import { ListData } from "@/configs/types";
import { scrollToTop } from "@/common/utils";
import axiosInstance from "@/common/axiosInstance";
import { GET_FILM_BY_FILTER } from "@/common/constant";
import ListFilmItemComponent, { FilmSkeletonComponent } from "./ListFilmItem";

export default function ListFilmByCountryComponent({
  slug,
  listDataFilters,
}: {
  slug: string;
  listDataFilters: ListData;
}) {
  const [filters, setFilters] = useState<any>({});
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataFilm, setDataFilm] = useState<any>({
    result: null,
    totalPages: 0,
    currentPage: 1,
  });
  const [fetchingData, setFetchingData] = useState(false);

  const getDataFilm = async (filters: any, limit?: number, page?: number) => {
    if (!filters) {
      setFetchingData(false);
      setDataFilm({ result: [] });
      return;
    }

    setFetchingData(true);
    try {
      const ress = await axiosInstance.post(
        GET_FILM_BY_FILTER,
        { filters: { ...filters }, limit: limit, page: page },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
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
      console.error("Error fetching data:", error);
    }
  };

  const prevPage = () => {
    if (currentPage === 1) return;
    setCurrentPage((prev) => prev - 1);
    scrollToTop();
  };

  const nextPage = () => {
    if (currentPage === totalPages) return;
    setCurrentPage((prev) => prev + 1);
    scrollToTop();
  };

  useEffect(() => {
    if (!slug) return;
    const newData = { ...filters };
    newData.country = slug;
    setFilters(newData);
    getDataFilm({ country: slug });
    scrollToTop();
  }, [slug]);

  useEffect(() => {
    if (!currentPage) return;
    getDataFilm({ country: slug }, undefined, currentPage);
  }, [currentPage]);

  // console.log("dataFilm >>", dataFilm);
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
              <button
                onClick={prevPage}
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#4660e6] text-center text-white disabled:bg-opacity-50"
                type="button"
                disabled={currentPage === 1}
              >
                <BsArrowLeft size={20} />
              </button>
              <Input
                className="h-10 w-16 bg-[#4660e6] text-center text-white disabled:bg-[#4660e6] disabled:bg-opacity-90 disabled:text-white"
                value={`${currentPage}/${totalPages}`}
                disabled
              />
              <button
                onClick={nextPage}
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#4660e6] text-center text-white disabled:bg-opacity-50"
                disabled={currentPage === totalPages}
              >
                <BsArrowRight size={20} />
              </button>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <section className="list-film-container w-full">
      <FiltersComponent
        filters={filters}
        setFilters={setFilters}
        fetching={fetchingData}
        onSubmit={getDataFilm}
        initValue={slug}
        path="quoc-gia"
        listData={listDataFilters}
      />
      {renderBodyContent()}
    </section>
  );
}
