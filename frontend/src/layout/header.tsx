"use client";

import React from "react";
import Link from "next/link";
import { Button } from "antd";
import Image from "next/image";
import { isEmpty } from "lodash";
import { toast } from "react-toastify";
import { BsSearch } from "react-icons/bs";
import { IoIosMenu } from "react-icons/io";
import { IoChevronDownSharp } from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";

import { menus } from "@/configs/menus";
import { getElement } from "@/common/utils";
import { isBrowser } from "@/common/constant";
import { HeaderAdsComponent } from "@/components/AdsComponents/AdsComponent";
import { SITE_CONFIG } from "@/configs/metadata-config";

export default function HeaderComponent({
  categories,
  countries,
  adsHeader,
}: {
  categories: any[];
  countries: any[];
  adsHeader?: any;
}) {
  const router = useRouter();
  const path = usePathname();

  const onSubmitSearch = (e: any) => {
    if (!isBrowser) return null;
    e.preventDefault();
    const keyword = e.target[0].value;
    if (!keyword) return toast.error("Vui lòng nhập từ khoá");
    router.push(`/search?query=${keyword}`);
    const btn = getElement(".btn-show-search");
    const favSearch = getElement(".fav-search-1");
    if (btn?.classList.contains("active")) {
      btn?.classList.remove("active");
    }
    if (favSearch?.classList.contains("active")) {
      favSearch?.classList.remove("active");
    }
  };

  const showMenuMobile = () => {
    if (isBrowser) {
      const listMenu = getElement(".menu-container");
      if (!listMenu) return;
      getElement("#nav-container")?.classList.toggle("active");
      getElement("body")?.classList.toggle("body-hidden");
      // listMenu.classList.toggle("active");
    }
  };

  const changeLink = (menu: (typeof menus)[0]) => {
    if (isBrowser) {
      const link = menu.slug;
      const listMenu = getElement("#nav-container")!;
      let result = false;

      const check = listMenu?.classList.contains("active");
      const bodyHidden = getElement("body")?.classList.contains("body-hidden");
      // Kiểm tra nếu đây là trang chính
      if (link === "/" && path === "/") {
        result = true;
      }

      // Kiểm tra nếu đây là một menu con
      if (menu.sub === true) {
        // Nếu không có element con hoặc nếu menu bắt đầu với một giá trị cụ thể
        if (!menu.startWith) {
          result = false;
        }
        // Kiểm tra xem đường dẫn hiện tại có bắt đầu với giá trị của menu hay không
        else result = path.startsWith(menu.startWith);
      } else {
        // Kiểm tra xem liên kết có khớp với đường dẫn hiện tại không
        result = link === path;
      }
      listMenu && check && listMenu?.classList.remove("active");
      if (bodyHidden) {
        getElement("body")?.classList.remove("body-hidden");
      }

      return result;
    }
  };

  const RenderTitleOrLogo = () => {
    if (SITE_CONFIG.titleShowed && !isEmpty(SITE_CONFIG.title)) {
      return (
        <Link
          className="logo-style relative flex w-max text-2xl font-bold"
          href="/"
        >
          {SITE_CONFIG.title}
        </Link>
      );
    }
    return (
      <Link
        className="logo-style relative flex h-[60px] w-[130px] text-4xl font-bold lg:h-20 lg:w-[190px]"
        href="/"
      >
        <Image
          src={SITE_CONFIG.logo}
          fill
          priority
          sizes="100vw"
          className="hidden 2lg:block"
          alt="Logo"
        />
        <Image
          src={SITE_CONFIG.logo}
          fill
          priority
          sizes="100vw"
          className=" 2lg:hidden"
          alt="Logo"
        />
      </Link>
    );
  };

  return (
    <header
      id="header-container"
      className="relative z-20 w-full md:border-b md:border-white md:border-opacity-5 md:bg-header md:bg-opacity-50 2lg:px-4"
    >
      <HeaderAdsComponent dataAds={adsHeader?.ads_content} />
      <div className="search-logo mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 p-2 sm:flex-row xl:gap-4">
        <span className="relative flex w-full items-center justify-center gap-4 sm:w-auto sm:justify-start">
          <button
            type="button"
            onClick={showMenuMobile}
            className="toggle-menu-mobile absolute left-4 rounded-full p-1 text-white transition-all duration-300 hover:bg-white hover:text-blueSecondary md:ml-0 md:hidden"
          >
            <IoIosMenu size={24} className="" />
          </button>
          <RenderTitleOrLogo />
        </span>
        <nav
          className="nav-container relative w-full max-w-full md:mx-auto"
          id="nav-container"
        >
          <div className="search-menu relative flex w-full items-center gap-6 px-5 pb-3 sm:hidden">
            <form
              className="search-item relative flex w-full items-center"
              onSubmit={onSubmitSearch}
            >
              <input
                // name="query"
                // autoFocus
                className="fill-keyword w-full rounded-md border border-[#4660e6] p-2 pr-[60px] text-sm text-[#4660e6]"
                placeholder="Tìm kiếm phim..."
              />
              <Button
                className="btn-submit !absolute right-0 z-10 !h-full !rounded-none !rounded-br-md !rounded-tr-md !border-[#4660e6] !bg-[#4660e6] p-2 text-sm !text-white"
                htmlType="submit"
              >
                Tìm kiếm
              </Button>
            </form>
          </div>

          <ul className="menu-container relative flex max-w-full items-center justify-center md:mx-auto lg:gap-3 2lg:gap-4">
            {menus.map((e, i) => {
              if (e.sub) {
                let submenus = [];

                if (e.name === "Thể loại") {
                  submenus = categories;
                } else {
                  submenus = countries;
                }
                return (
                  <li
                    className={`menu-item menu-item-has-children relative text-sm font-bold uppercase transition-all duration-300 ${
                      changeLink(e) ? "active" : ""
                    }`}
                    key={`${i}${e.slug}`}
                  >
                    <span
                      // href={e.slug}
                      className={`title-item title-main-container flex !h-10 w-full items-center gap-1 py-2 hover:cursor-pointer md:py-4 ${
                        changeLink(e) ? "text-[#4660e6]" : ""
                      }`}
                      onClick={() => {
                        const submenu = getElement(`.submenu-${i}`);
                        if (submenu) {
                          submenu.classList.toggle("active");
                        }
                      }}
                    >
                      {e.name}
                      <IoChevronDownSharp size={16} />
                    </span>
                    {!isEmpty(submenus) && (
                      <div
                        className={`submenu-container submenu-${i} md:rounded-lg md:p-2`}
                      >
                        <ul
                          className="submenu w-full md:max-h-[320px]"
                          id="submenu"
                        >
                          {submenus?.map((val, it) => (
                            <li
                              role="button"
                              key={`b${val.slug}${it}`}
                              className={`children-item relative border-b border-b-blueSecondary py-2 text-sm font-normal capitalize transition-all duration-300 hover:cursor-pointer hover:text-blueSecondary ${
                                e.startWith + "/" + val.slug === path
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => {
                                changeLink(e);
                              }}
                            >
                              <Link
                                href={`${e.startWith}/${val.slug}`}
                                id="children-link"
                                className="inline-block h-full w-full"
                                prefetch={false}
                              >
                                {val.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              }
              return (
                <li
                  className={`menu-item relative text-base font-bold uppercase transition-all duration-300 hover:text-[#4B50E6] ${
                    changeLink(e) ? "active text-[#4660e6]" : ""
                  }`}
                  key={`b${e.name}`}
                  onClick={() => changeLink(e)}
                >
                  <Link
                    href={`${e.slug}`}
                    className="inline-block h-full w-full py-3 md:py-2"
                    prefetch={false}
                  >
                    {e.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          className="btn-show-search p-2 hover:text-[#4660e6] xl:hidden"
          onClick={() => {
            if (isBrowser) {
              const btn = getElement(".btn-show-search");
              const favSearch = getElement(".fav-search-1");
              btn?.classList.toggle("active");
              favSearch?.classList.toggle("active");
              // favSearch?.querySelector("input")?.focus();
            }
          }}
        >
          <BsSearch size={24} />
        </button>

        {path !== "/search" && (
          <div className="fav-search-1 flex w-full items-center gap-6 sm:w-auto 2lg:pr-5">
            <form
              className="search-item relative flex w-full items-center sm:w-auto"
              onSubmit={onSubmitSearch}
            >
              <input
                name="query"
                // autoFocus
                className="fill-keyword w-full rounded-md border border-[#4660e6] p-2 pr-[95px] text-sm text-[#4660e6] sm:w-[300px]"
                placeholder="Bạn muốn tìm phim gì ?..."
              />
              <Button
                className="btn-submit !absolute right-0 z-10 !h-full !rounded-none !rounded-br-md !rounded-tr-md !border-[#4660e6] !bg-[#4660e6] p-2 text-sm !text-white"
                htmlType="submit"
              >
                Tìm kiếm
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
