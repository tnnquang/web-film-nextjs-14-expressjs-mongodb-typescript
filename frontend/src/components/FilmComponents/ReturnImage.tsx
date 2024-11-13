"use client";

import Image from "next/image";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";

import { IFilm } from "@/configs/types";
import { BASE_URL_API, fetchOrigin } from "@/common/constant";

export default function ReturnImage({ item }: { item: IFilm }) {
  const [imgSrc, setImgSrc] = useState<string>(
    isEmpty(item.thumbnail)
      ? "/blur_img.webp"
      : item.thumbnail.startsWith("https")
        ? item.thumbnail
        : `/${item.thumbnail}`
  );
  useEffect(() => {
    if (imgSrc === "/blur_img.webp") return;
    let urlFetch = "";
    if (imgSrc.startsWith("https")) {
      urlFetch = imgSrc;
    } else if (imgSrc.startsWith("assets")) {
      urlFetch = `${BASE_URL_API}/${imgSrc}`;
    }
    async function imageLoader() {
      const fetchImg = await fetch(urlFetch, {
        headers: { ...fetchOrigin },
      });
      if (fetchImg.ok) {
        if (imgSrc.startsWith("https")) {
          return;
        } else {
          setImgSrc(`${BASE_URL_API}/${item.thumbnail}`);
        }
      } else {
        setImgSrc("/bg-match-item.png");
      }
    }
    imageLoader();
  }, [imgSrc]);

  return (
    <Image
      src={imgSrc}
      fill
      alt={item.title ?? ""}
      loading="lazy"
      // placeholder="blur"
      // blurDataURL={"/blur_img.webp"}
      className="object-cover transition-all duration-300 hover:scale-105"
      sizes="100vw"
      quality={60}
    />
  );
}

export function ReturnImageCommingSoon({ item }: { item: IFilm }) {
  const [imgSrc, setImgSrc] = useState<string>(
    isEmpty(item.thumbnail)
      ? "/blur_img.webp"
      : item.thumbnail.startsWith("https")
        ? item.thumbnail
        : `/${item.thumbnail}`
  );
  useEffect(() => {
    if (imgSrc === "/blur_img.webp") return;
    let urlFetch = "";
    if (imgSrc.startsWith("https")) {
      urlFetch = imgSrc;
    } else if (imgSrc.startsWith("assets")) {
      urlFetch = `${BASE_URL_API}/${imgSrc}`;
    }
    async function imageLoader() {
      const fetchImg = await fetch(urlFetch, {
        headers: { ...fetchOrigin },
      });
      if (fetchImg.ok) {
        if (imgSrc.startsWith("https")) {
          return;
        } else {
          setImgSrc(`${BASE_URL_API}/${item.thumbnail}`);
        }
      } else {
        setImgSrc("/bg-match-item.png");
      }
    }
    imageLoader();
  }, [imgSrc]);

  return (
    <Image
      src={imgSrc}
      fill
      sizes="100vw"
      alt={item.title as string}
      className="object-cover"
      // placeholder="blur"
      // blurDataURL={"/blur_img.webp"}
      loading="lazy"
      quality={50}
    />
  );
}

export function ReturnImageHotFilm({ item }: { item: IFilm }) {
  const [imgSrc, setImgSrc] = useState(
    isEmpty(item.thumbnail)
      ? "/blur_img.webp"
      : `${BASE_URL_API}/${item.thumbnail}`
  );
  useEffect(() => {
    if (imgSrc === "/blur_img.webp") return;
    async function imageLoader() {
      const fetchImg = await fetch(`${BASE_URL_API}/${item.thumbnail}`, {
        headers: {
          ...fetchOrigin,
        },
      });
      if (fetchImg.ok) {
        setImgSrc(`${BASE_URL_API}/${item.thumbnail}`);
      } else {
        setImgSrc("/bg-match-item.png");
      }
    }
    imageLoader();
  }, [imgSrc]);

  return (
    <Image
      src={imgSrc}
      fill
      sizes="100vw"
      loading="lazy"
      alt={item.title as string}
      // placeholder="blur"
      // blurDataURL={"/blur_img.webp"}
    />
  );
}
