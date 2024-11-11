import { FaCirclePlay } from "react-icons/fa6";

import { fetchAds, getDataFromSlug } from "@/common/utils";
import HandlePlayVideoComponent from "@/components/FilmComponents/HandlePlayVideoComponent";
import { revalidatePath } from "next/cache";

type NextPageProps = {
  params: { slug: string[] };
};

export default async function WatchFilm({ params }: NextPageProps) {
  const slug = params.slug;

  const fetchData = async (): Promise<any | null> => {
    const data = await getDataFromSlug(slug[0]);
    return data;
  };

  const [item, ads] = await Promise.all([fetchData(), fetchAds()]);

  if (!item || slug?.length > 2)
    return (
      <div className="relative mb-2 flex h-[400px] w-full max-w-full animate-pulse items-center justify-center rounded-xl bg-brandLinear bg-opacity-20 xl:h-[500px] 2xl:h-[550px]">
        <FaCirclePlay size={44} />
      </div>
    );

  revalidatePath("/xem-phim/[...slug]", "page");
  return (
    <HandlePlayVideoComponent
      item={item}
      adsInPlayer={ads?.in_player}
      slug={slug}
    />
  );
}
