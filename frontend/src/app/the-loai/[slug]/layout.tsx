import axiosInstance from "@/common/axiosInstance";
import { BASE_URL_FRONTEND, GET_ONE_CATEGORY } from "@/common/constant";
import NotFoundComponent from "@/components/404";
import Spinner from "@/components/LoadingComponents/Spinner";
import { SITE_CONFIG } from "@/configs/metadata-config";
import { Metadata } from "next";
import { Suspense } from "react";

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const res = await axiosInstance
    .get(`${GET_ONE_CATEGORY}?slug=${slug}`, {
      // method: "GET",
      headers: {
        // ...fetchOrigin,
      },
    })
    .then((value) => value.data);
  if (res?.result) {
    const item = res?.result;
    return {
      title: `Phim theo Thể loại ${item?.name} | ${SITE_CONFIG.title}`,
      description: SITE_CONFIG.home,
      metadataBase: new URL(BASE_URL_FRONTEND),
    };
  }

  return {
    title: "Không tìm thấy trang này",
    description: SITE_CONFIG.home,
  };
}

export default async function ListLayout({ children, params }: Props) {
  const slug = params.slug;
  const ress = await axiosInstance
    .get(`${GET_ONE_CATEGORY}?slug=${slug}`, {
      // method: "GET",
      headers: {
        // "Content-Type": "text/plain",
        // ...fetchOrigin,
      },
    })
    .then((value) => value.data);
  // console.log("layout.tsx: Response category one >> ", slug, " >> ");
  if (ress.result) {
    const data = ress?.result;
    if (data)
      return (
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <div className="h-full w-full">
            <p className="my-2 w-full text-xl font-bold">
              {slug === "tv-shows"
                ? "Danh sách các "
                : "Danh phim theo thể loại "}
              <span className="name-of rounded-xl bg-blueSecondary px-2 py-1 shadow-lg">
                {data.name}
              </span>
            </p>
            {children}
          </div>
        </Suspense>
      );
    return <NotFoundComponent />;
  } else throw new Error(`Error: ${ress.statusText}`);
}
