"use client";

import { isEmpty } from "lodash";
import { PaginationProps, Pagination } from "antd";
import React, { Suspense, useEffect, useMemo, useState } from "react";

import FiltersComponent from "../Filters";
import { ListData } from "@/configs/types";
import { scrollToTop } from "@/common/utils";
import axiosInstance from "@/common/axiosInstance";
import { GET_FILM_BY_FILTER, DEFAULT_ITEMS } from "@/common/constant";
import ListFilmItemComponent, { FilmSkeletonComponent } from "./ListFilmItem";

export default function FilmsByListComponent({
  id,
  listDataFilters,
}: {
  id: string;
  listDataFilters: ListData;
}) {
  //params = phim-le, phim-bo, dien vien, dao dien (dua theo type di kem)
  const [filters, setFilters] = useState<any>({}); //Phim lẻ
  const [dataFilm, setDataFilm] = useState<any>({
    result: null,
    totalPages: 0,
    currentPage: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fetchingData, setFetchingData] = useState(false);

  const getDataFilm = async (filters: any, page: number, limit?: number) => {
    if (!filters) {
      setFetchingData(false);
      setDataFilm({ result: [] });
      return;
    }

    setFetchingData(true);
    try {
      const ress = await axiosInstance.post(
        GET_FILM_BY_FILTER,
        { filters: { ...filters }, page, limit: limit || DEFAULT_ITEMS },
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
      setTotalPages(0);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!id) return;

    const arrSlug = decodeURIComponent(id).split("&");
    if (arrSlug.length === 2) {
      const type = arrSlug[1].split("=")[1];
      const newData = { ...filters };
      newData[type] = arrSlug[0];
      // console.log("hehehee >>>>", newData);
      setFilters(newData);
      getDataFilm({ [type]: arrSlug[0] }, currentPage);
    } else {
      const newData = { ...filters };
      newData.type = id;
      setFilters(newData);
      getDataFilm({ type: id }, currentPage);
    }
  }, [id]);

  useEffect(() => {
    if (!currentPage || currentPage == 0 || currentPage > totalPages) return;
    if (!id) return;
    setDataFilm({ result: null });
    getDataFilm(filters, currentPage);
    scrollToTop();
  }, [currentPage]);

  const onChangePage: PaginationProps["onChange"] = (page) => {
    setCurrentPage(page);
  };

  const BodyContent = useMemo(() => {
   
    return (
      <>
        <div className="data-list-film flex flex-wrap items-start gap-2">
          <Suspense fallback={<FilmSkeletonComponent />}>
            <ListFilmItemComponent listFilm={dataFilm?.result} />
          </Suspense>
        </div>
        {!isEmpty(dataFilm?.result) && (
          <div className="group-btn-action-page mx-auto mb-6 mt-8 w-full">
            <div className="pagination mx-auto">
              <Pagination
                current={currentPage}
                onChange={onChangePage}
                total={DEFAULT_ITEMS * totalPages}
                defaultPageSize={DEFAULT_ITEMS}
                showSizeChanger={false}
                className="flex justify-center"
              />
            </div>
          </div>
        )}
      </>
    );
  }, [dataFilm?.result]);

  return (
    <section className="list-film-container w-full">
      <FiltersComponent
        filters={filters}
        setFilters={setFilters}
        fetching={fetchingData}
        // setFetching={setFetchingData}
        onSubmit={getDataFilm}
        listData={listDataFilters}
      />
      {BodyContent}
    </section>
  );
}
