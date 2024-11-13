"use client";

import Link from "next/link";
import Image from "next/image";
import { ITEM_ADS, TADS_CONTENT } from "@/configs/types";
import { isEmpty } from "lodash";
import { useState } from "react";

// 1. Header banner: ( trên banner )
//     1. List header - mobile / pc —  2 mode: single ( dài ) - dual ( 2 cái ) -  max 2 banner
// 2. Row 1 ( dưới banner ): 2 mode: single ( dài ) - dual ( 2 cái ) - max 3 row
// 3. Row 2 ( dưới list content 1): 2 mode: single ( dài ) - dual ( 2 cái ) - max 3 row
// 4. Row 3 ( dưới list content 2): 2 mode: single ( dài ) - dual ( 2 cái ) - max 3 row
// 5. silde: right, left: single ( dài dọc ) - chỉ hiển thị trên PC
// 6. footer : 2 mode: single ( dài ) - dual ( 2 cái ) - max 2 row
// 7. list app
// 8. Popup - max 1 popup
// 9. Ads in player:
//     1. Before play: video (max 10s)
//     2. End play : video ( max 10s )
//     3. In play - under video ( gif / image )
// 10. Button: button in each content: name - href. - max 1 button. Ex: button: name: Đặt Cược - href : https://google.com.vn
// 11. Button in player tool bar - max 1 button.

export function HeaderAdsComponent({
  dataAds,
}: {
  dataAds: any[] | null | undefined;
}) {
  return dataAds && dataAds.length > 0 ? (
    <section className="mx-auto w-full max-w-[1800px] 2lg:px-4">
      <div className="mx-auto w-full">
        {dataAds.map((item: any, index) =>
          item.mode === "dual" ? (
            <div
              className="relative flex w-full flex-col items-center md:flex-row"
              key={index.toString() + "du"}
            >
              <Link
                prefetch={false}
                key={index.toString() + "pp"}
                href={item.href || ""}
                target="_blank"
                //onClick={() => window.open(item.href, "_blank")}
                className={`relative inline-block h-[90px] w-full border border-gray-400 bg-pink-700 text-center align-middle`}
              >
                <img
                  src={item.content}
                  alt=""
                  className="absolute !block h-full w-full object-fill"
                  // sizes="100vw"
                />
              </Link>
              <Link
                prefetch={false}
                key={index.toString() + "ppq"}
                href={item.href || ""}
                target="_blank"
                className={`relative inline-block h-[90px] w-full border border-gray-400 bg-pink-700 text-center align-middle`}
              >
                <img
                  src={item.content}
                  alt={item.href || ""}
                  className="absolute !block h-full w-full object-fill"
                />
              </Link>
            </div>
          ) : (
            <div className="relative w-full" key={index.toString() + "si"}>
              <Link
                prefetch={false}
                key={index.toString() + "pp"}
                href={item.href || ""}
                target="_blank"
                className={`relative inline-block h-[90px] w-full`}
              >
                <img
                  src={item.content}
                  alt={item.href || ""}
                  className="absolute !block h-full w-full object-fill"
                />
              </Link>
            </div>
          )
        )}
      </div>
    </section>
  ) : null;
}

export function Row1AdsComponent({
  dataAds,
}: {
  dataAds: any[] | null | undefined;
}) {
  return dataAds && dataAds.length > 0 ? (
    <section className="row1-bn any-data-wrapper relative z-[1] mx-auto my-3 w-full">
      {dataAds.map((item: any, index) =>
        item.mode === "dual" ? (
          <div
            className="relative flex w-full flex-col items-center md:flex-row"
            key={index.toString() + "dual"}
          >
            <Link
              prefetch={false}
              key={index.toString() + "pp"}
              href={item.href || ""}
              target="_blank"
              //onClick={() => window.open(item.href, "_blank")}
              className={`relative inline-block w-full ${
                index >= 1 ? "h-[75px]" : "h-[60px]"
              }  w-full border border-gray-400 bg-pink-700 text-center align-middle`}
            >
              <img
                src={item.content}
                alt=""
                className="absolute !block h-full w-full object-fill"
                // sizes="100vw"
              />
            </Link>
            <Link
              prefetch={false}
              key={index.toString() + "pp1"}
              href={item.href || ""}
              target="_blank"
              className={`relative inline-block w-full ${
                index >= 1 ? "h-[75px]" : "h-[60px]"
              }  w-full border border-gray-400 bg-pink-700 text-center align-middle`}
            >
              <img
                src={item.content}
                alt=""
                className="absolute !block h-full w-full object-fill"
                // sizes="100vw"
              />
            </Link>
          </div>
        ) : (
          <div className="relative w-full" key={index.toString() + "single"}>
            <Link
              prefetch={false}
              key={index.toString() + "pp"}
              href={item.href || ""}
              target="_blank"
              className={`relative inline-block w-full ${
                index >= 1 ? "h-[75px]" : "h-[60px]"
              }`}
            >
              <img
                src={item.content}
                alt={item.href || ""}
                className="absolute !block h-full w-full object-fill"
              />
            </Link>
          </div>
        )
      )}
    </section>
  ) : null;
}

export function Row2AdsComponent({
  dataAds,
}: {
  dataAds: any[] | null | undefined;
}) {
  return dataAds && dataAds.length > 0 ? (
    <section className="row2-bn mb-2 w-full">
      {dataAds.map((item: any, index) =>
        item.mode === "dual" ? (
          <div
            className="relative flex w-full flex-col items-center md:flex-row"
            key={index.toString() + "dual"}
          >
            <Link
              prefetch={false}
              key={index.toString() + "pp"}
              href={item.href || ""}
              target="_blank"
              //onClick={() => window.open(item.href, "_blank")}
              className={`relative inline-block h-[60px] w-full border border-gray-400 bg-pink-700 text-center align-middle`}
            >
              <img
                src={item.content}
                alt=""
                className="absolute !block h-full w-full object-fill"
                // sizes="100vw"
              />
            </Link>
            <Link
              prefetch={false}
              key={index.toString() + "pp1"}
              href={item.href || ""}
              target="_blank"
              className={`relative inline-block h-[60px] w-full border border-gray-400 bg-pink-700 text-center align-middle`}
            >
              <img
                src={item.content}
                alt=""
                className="absolute !block h-full w-full object-fill"
                // sizes="100vw"
              />
            </Link>
          </div>
        ) : (
          <div className="relative w-full" key={index.toString() + "single"}>
            <Link
              prefetch={false}
              key={index.toString() + "pp"}
              href={item.href || ""}
              target="_blank"
              className={`relative inline-block h-[60px] w-full`}
            >
              <img
                src={item.content}
                alt={item.href || ""}
                className="absolute !block h-full w-full object-fill"
              />
            </Link>
          </div>
        )
      )}
    </section>
  ) : null;
}

export function Row3AdsComponent({
  dataAds,
}: {
  dataAds: any[] | null | undefined;
}) {
  return dataAds && dataAds.length > 0 ? (
    <section className="row1-bn my-2 w-full">
      {dataAds.map((item: any, index) =>
        item.mode === "dual" ? (
          <div
            className="relative flex w-full flex-col items-center md:flex-row"
            key={index.toString() + "dual"}
          >
            <Link
              prefetch={false}
              key={index.toString() + "pp"}
              href={item.href || ""}
              target="_blank"
              //onClick={() => window.open(item.href, "_blank")}
              className={`relative inline-block h-[60px] w-full border border-gray-400 bg-pink-700 text-center align-middle`}
            >
              <img
                src={item.content}
                alt=""
                className="absolute !block h-full w-full object-fill"
                // sizes="100vw"
              />
            </Link>
            <Link
              prefetch={false}
              key={index.toString() + "pp1"}
              href={item.href || ""}
              target="_blank"
              className={`relative inline-block h-[60px] w-full border border-gray-400 bg-pink-700 text-center align-middle`}
            >
              <img
                src={item.content}
                alt=""
                className="absolute !block h-full w-full object-fill"
                // sizes="100vw"
              />
            </Link>
          </div>
        ) : (
          <div className="relative w-full" key={index.toString() + "single"}>
            <Link
              prefetch={false}
              key={index.toString() + "pp"}
              href={item.href || ""}
              target="_blank"
              className={`relative inline-block h-[60px] w-full`}
            >
              <img
                src={item.content}
                alt={item.href || ""}
                className="absolute !block h-full w-full object-fill"
              />
            </Link>
          </div>
        )
      )}
    </section>
  ) : null;
}

export function FooterAdsComponent({
  dataAds,
}: {
  dataAds: any[] | null | undefined;
}) {
  return dataAds && dataAds.length > 0 ? (
    <section className="fixed bottom-0 left-1/2 z-50 mx-auto w-full max-w-[1800px] -translate-x-1/2 2lg:px-4">
      <div className="any-data-wrapper mx-auto w-full pl-3 pr-[10px] 2lg:px-0 2lg:pr-0">
        {dataAds.map((item: any, index) =>
          item.mode === "dual" ? (
            <div
              className="relative flex w-full flex-col items-center justify-center md:flex-row"
              key={index.toString() + "du"}
            >
              <Link
                prefetch={false}
                key={index.toString() + "pp"}
                href={item.href || ""}
                target="_blank"
                //onClick={() => window.open(item.href, "_blank")}
                className={`relative inline-block w-full ${
                  index >= 1 ? "h-[80px]" : "h-[70px]"
                }  w-full border border-gray-400 bg-pink-700 text-center align-middle`}
              >
                <img
                  src={item.content}
                  alt=""
                  className="absolute !block h-full w-full object-fill"
                  // sizes="100vw"
                />
              </Link>
              <Link
                prefetch={false}
                key={index.toString() + "pp4"}
                href={item.href || ""}
                target="_blank"
                className={`relative inline-block w-full ${
                  index >= 1 ? "h-[80px]" : "h-[70px]"
                }  w-full border border-gray-400 bg-pink-700 text-center align-middle`}
              >
                <img
                  src={item.content}
                  alt={item.href || ""}
                  className="absolute !block h-full w-full object-fill"
                  // sizes="100vw"
                />
              </Link>
            </div>
          ) : (
            <div
              className="relative flex w-full items-center justify-center"
              key={index.toString() + "si"}
            >
              <Link
                prefetch={false}
                key={index.toString() + "pp"}
                href={item.href || ""}
                target="_blank"
                className={`relative inline-block w-full  ${
                  index >= 1 ? "h-[80px]" : "h-[70px]"
                }`}
              >
                <img
                  src={item.content}
                  alt={item.href || ""}
                  className="absolute !block h-full w-full object-fill"
                />
              </Link>
            </div>
          )
        )}
      </div>
    </section>
  ) : null;
}

export function PopupAdsComponent({
  dataAds,
}: {
  dataAds: TADS_CONTENT[] | null | undefined;
}) {
  const [show, setShow] = useState(true);

  // console.log("Ads popup", dataAds);
  return dataAds && dataAds?.length > 0 ? (
    show ? (
      <div
        onClick={() => {
          setShow(false);
        }}
        className="bg-slate-300 fixed left-0 top-0 z-[300] flex h-full w-full items-center justify-center bg-black bg-opacity-25 backdrop-blur-[2px]"
      >
        <div className="content-wrapper relative h-[300px] w-[95%] max-w-[600px] md:h-[400px]">
          {/* <button
            className="btn-close absolute right-0 top-0 z-10 bg-blueSecondary px-3 py-1 text-white hover:opacity-90"
            onClick={() => {
              setShow(false);
            }}
          >
            <IoMdClose size={20} />
          </button>  */}
          <Image
            src={dataAds[0]?.content}
            fill
            priority
            sizes="100vw"
            alt=""
            quality={50}
            onClick={() => window?.open(dataAds[0]?.href, "_blank")}
          />
        </div>
      </div>
    ) : null
  ) : null;
}

export function LeftSideAdsComponent({
  dataAds,
}: {
  dataAds?: ITEM_ADS | null;
}) {
  // console.log("LeftSideAdsComponent", dataAds);
  if (!isEmpty(dataAds?.ads_content)) {
    return (
      <div className="ads-side-left fixed hidden pt-20 2lg:block">
        <Link
          prefetch={false}
          href={dataAds?.ads_content[0]?.href || ""}
          className="relative block h-[450px] w-[90px]"
          target="_blank"
        >
          <Image
            src={dataAds?.ads_content[0]?.content as any}
            alt=""
            fill
            sizes="100vw"
            quality={50}
          />
        </Link>
      </div>
    );
  }
  return null;
}

export function RightSideAdsComponent({
  dataAds,
}: {
  dataAds?: ITEM_ADS | null;
}) {
  if (!isEmpty(dataAds?.ads_content)) {
    return (
      <div className="ads-side-right fixed hidden pt-20 2lg:block">
        <Link
          prefetch={false}
          href={dataAds?.ads_content[1]?.href || ""}
          className="relative block h-[450px] w-[90px]"
          target="_blank"
        >
          <Image
            src={dataAds?.ads_content[1]?.content as any}
            alt=""
            fill
            sizes="100vw"
            quality={50}
          />
        </Link>
      </div>
    );
  }
  return null;
}
