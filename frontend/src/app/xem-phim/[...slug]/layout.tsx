import { isEmpty } from "lodash";
import { Metadata, ResolvingMetadata } from "next";

import {
  generateMetadataForXemPhim,
  returnDefaultImageURL_v2,
} from "@/common/utils";
import NotFoundComponent from "@/components/404";
import {
  BASE_URL_API,
  GET_FILM_FROM_SLUG,
  fetchOrigin,
} from "@/common/constant";
import { SITE_CONFIG } from "@/configs/metadata-config";
import ListFilmSameGenre from "@/components/FilmComponents/ListFilmSameGenre";
import Link from "next/link";

type Props = {
  params: { slug: string[] };
  // searchParams: { [key: string]: string | string[] | undefined };
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const slug = params.slug;

  if (slug.length > 2) {
    return {
      title: `Đường dẫn không đúng | ${SITE_CONFIG.home}`,
      description: SITE_CONFIG.description,
    };
  }

  // fetch data
  const product = await fetch(`${BASE_URL_API}${GET_FILM_FROM_SLUG}`, {
    method: "POST",
    headers: {
      Accept: "application.json",
      "Content-Type": "application/json",
      ...fetchOrigin,
    },
    body: JSON.stringify({
      slug: slug[0],
    }),
  }).then((res) => res.json());
  if (!product.item) {
    return {
      title: `Không tìm thấy phim | ${SITE_CONFIG.home}`,
      description: SITE_CONFIG.description,
    };
  }

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  const thumb = returnDefaultImageURL_v2(product.item.thumbnail);

  return generateMetadataForXemPhim(product.item, slug, thumb, previousImages);
}

export default function WatchFilmLayout({ children, params }: Props) {
  const slug = params.slug;

  // fetch data
  const fetchData = () => {
    return fetch(`${BASE_URL_API}${GET_FILM_FROM_SLUG}`, {
      method: "POST",
      headers: {
        Accept: "application.json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: slug[0],
        type: "short",
      }),
      next: { revalidate: 900, tags: ["watch-film"] },
    })
      .then((res) => res.json())
      .then((product) => {
        if (isEmpty(product.item)) {
          return Promise.reject("Not Found");
        }
        return Promise.resolve(product);
      })
      .catch(() => Promise.resolve({ item: null }));
  };

  return fetchData().then((product) => {
    if (isEmpty(product.item) || slug?.length > 2) {
      return <NotFoundComponent />;
    }
    return (
      <div className="main-page w-full">
        {children}
        <div className="list-film-container w-full">
          <ListFilmSameGenre
            listCategory={product.item?.categories}
            title={product.item.title}
          />
        </div>
        <div className="keywords">
          <span className="text-keywords text-base font-bold underline">
            Các từ khoá tìm kiếm/Keywords:{" "}
          </span>
          {product.item.keywords.map((el: string, index: number) => (
            <Link
              href={`/search?query=${el}`}
              key={el + index + "yui"}
              target="_blank"
              className="text-sm text-opacity-70 hover:text-red-500 hover:text-opacity-60"
            >
              {el}
              {index < product.item.keywords.length - 1 ? ", " : "."}
            </Link>
          ))}
        </div>
      </div>
    );
  });
}
