"use client";

import React, { useState } from "react";
import { Button, Col, Form, Input, Row } from "antd";

import { ListData } from "@/configs/types";
import { useRouter } from "next/navigation";
import OneSelectItem from "../SelectComponents/Select";

function FiltersServerComponent({
  filters,
  keyword,
  isSearching = false,
  initValue,
  path,
  listData,
}: {
  filters: any;
  keyword?: string;
  isSearching?: boolean;
  initValue?: string;
  path?: string;
  listData: ListData;
}) {
  const [form] = Form.useForm();
  const router = useRouter();

  // console.log("initial value", initValue);

  const [currentFilters, setFilters] = useState(filters);
  const [fetching, setFetching] = useState(false);
  const handleCategoryChange = (value: any) => {
    const newData = { ...filters };
    if (!value || value === "undefined") {
      delete newData.category;
      router.push(`?${new URLSearchParams(newData).toString()}`);
      setFilters(newData);
    }
    newData.category = value;
    filters = newData;
    setFilters(newData);
  };

  const handleCountryChange = (value: any) => {
    const newData = { ...filters };
    if (!value || value === "undefined") {
      delete newData.country;
      router.push(`?${new URLSearchParams(newData).toString()}`);
      setFilters(newData);
    }
    newData.country = value;
    setFilters(newData);
  };

  // console.log("filters", filters);

  return (
    <div className="filters-container w-full">
      <Form
        form={form}
        layout="vertical"
        requiredMark
        className="rounded-lg p-3"
        onValuesChange={(x) => {
          if (x.keyword) {
            // console.log("hehehee keyword changed", x);
            const newData = { ...filters };
            newData.keyword = x.keyword;
            setFilters(newData);
          }
        }}
      >
        {isSearching && (
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                initialValue={keyword}
                name="keyword"
                label={
                  <span className="text-white">
                    Nhập phim bạn muốn tìm kiếm
                  </span>
                }
                rules={[{ required: false }]}
              >
                <Input
                  className="w-full"
                  placeholder="Bạn muốn tìm phim gì ?"
                  autoFocus
                />
              </Form.Item>
            </Col>
          </Row>
        )}
        <Row gutter={16} wrap>
          <Col xs={24} md={8} xl={6}>
            <Form.Item name="category" rules={[{ required: false }]}>
              <OneSelectItem
                options={listData.categories}
                placeholder="--Chọn thể loại--"
                handleChange={handleCategoryChange}
                style={{
                  width: "100%",
                }}
                className="custom-select-selector"
                popupClassName="!bg-[#2b1867] custom-popup-option"
                defaultValue={
                  path === "the-loai"
                    ? initValue || undefined
                    : currentFilters.category || undefined
                }
                allowClear={!(path === "the-loai")}
                disabled={path === "the-loai"}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8} xl={6}>
            <Form.Item name="country" rules={[{ required: false }]}>
              <OneSelectItem
                options={listData.countries}
                placeholder="--Chọn quốc gia--"
                handleChange={handleCountryChange}
                style={{
                  width: "100%",
                }}
                className="custom-select-selector"
                popupClassName="!bg-[#2b1867] custom-popup-option"
                defaultValue={
                  path === "quoc-gia"
                    ? initValue || undefined
                    : currentFilters.country || undefined
                }
                allowClear={!(path === "quoc-gia")}
                disabled={path === "quoc-gia"}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8} xl={6}>
            <Form.Item className="w-full">
              <Button
                className="w-full !bg-blueSecondary !text-white hover:!border-[#5142FC]"
                type="primary"
                htmlType="submit"
                loading={fetching}
                onClick={() => {
                  router.push(
                    `?${new URLSearchParams(currentFilters).toString()}`
                  );
                  setFetching(false);
                }}
              >
                Lọc phim
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default FiltersServerComponent;
