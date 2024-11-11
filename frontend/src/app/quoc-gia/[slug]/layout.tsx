import { Metadata } from "next";

import NotFoundComponent from "@/components/404";
import { SITE_CONFIG } from "@/configs/metadata-config";
import { BASE_URL_FRONTEND, GET_ONE_COUNTRY } from "@/common/constant";
import axiosInstance from "@/common/axiosInstance";

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props
  // parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const slug = params.slug;
  const res = await axiosInstance
    .get(`${GET_ONE_COUNTRY}?slug=${slug}`, {
      // method: "GET",
      headers: {
        // "Content-Type": "text/plain",
        // ...fetchOrigin,
      },
    })
    .then((value) => value.data);
  if (res.result) {
    const item = res.result;
    return {
      title: `Danh sách phim theo Quốc gia ${item?.name} | ${SITE_CONFIG.title}`,
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
    .get(`${GET_ONE_COUNTRY}?slug=${slug}`, {
      // method: "GET",
      headers: {
        // "Content-Type": "text/plain",
        // ...fetchOrigin,
      },
    })
    .then((value) => value.data);
  // console.log("layout.tsx: Response country one >> ", slug, " >> ", ress);
  if (ress.result)
    return (
      <div className="h-full w-full">
        <p className="my-2 w-full text-xl font-bold">
          Danh phim theo Quốc gia{" "}
          <span className="name-of rounded-xl bg-blueSecondary px-2 py-1 shadow-lg">
            {ress.result.name}
          </span>
        </p>
        {children}
      </div>
    );
  return <NotFoundComponent />;
}
