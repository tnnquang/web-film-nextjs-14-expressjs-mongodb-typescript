"use client";

import React from "react";
import { Button, Col, Form, Input, Row } from "antd";

import OneSelectItem from "./SelectComponents/Select";
import { ListData } from "@/configs/types";



function FiltersComponent({
  filters,
  setFilters,
  fetching,
  onSubmit,
  keyword,
  isSearching = false,
  initValue,
  path,
  listData,
}: {
  filters: any;
  setFilters: any;
  fetching: boolean;
  onSubmit: any;
  keyword?: string;
  isSearching?: boolean;
  initValue?: string;
  path?: string;
  listData: ListData;
}) {
  const [form] = Form.useForm();

  const handleCategoryChange = (value: any) => {
    const newData = { ...filters };
    newData.category = value;
    filters = newData;
    // setFilters(newData);
  };

  const handleCountryChange = (value: any) => {
    const newData = { ...filters };
    newData.country = value;
    setFilters(newData);
  };

  // const handleQualityChange = (value: any) => {
  //   const newData = { ...filters };
  //   newData.quality = value;
  //   setFilters(newData);
  // };
  // const handleSearchInputChange = (e: any) => {
  //   const newData = { ...filters };
  //   newData.keyword = e.target.value;
  //   setFilters(newData);
  // };

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
                defaultValue={path === "the-loai" ? initValue : undefined}
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
                defaultValue={path === "quoc-gia" ? initValue : undefined}
              />
            </Form.Item>
          </Col>

          {/* <Col xs={24} md={8} xl={6}>
            <Form.Item name="quality" rules={[{ required: false }]}>
              <OneSelectItem
                options={listData.qualities}
                placeholder="--Chọn chất lượng--"
                handleChange={handleQualityChange}
                style={{
                  width: "100%",
                }}
                className="custom-select-selector"
                popupClassName="!bg-[#2b1867] custom-popup-option"
              />
            </Form.Item>
          </Col> */}
          <Col xs={24} md={8} xl={6}>
            <Form.Item className="w-full">
              <Button
                className="w-full !bg-blueSecondary !text-white hover:!border-[#5142FC]"
                type="primary"
                htmlType="submit"
                loading={fetching}
                onClick={() => {
                  onSubmit(filters);
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

export default FiltersComponent;
