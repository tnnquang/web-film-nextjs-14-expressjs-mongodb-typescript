import { Metadata } from "next";

import SearchComponent from "@/components/SearchComponent";
import { getListCategory, getListCountry } from "@/common/utils";
import { SITE_CONFIG } from "@/configs/metadata-config";

type Props = {
  searchParams: { [key: string]: string | string[] | null | undefined };
};

export function generateMetadata({ searchParams }: Props): Metadata {
  // read route params
  const query = searchParams.query;
  if (query) {
    return {
      title: `Kết quả tìm kiếm của từ khoá: ${decodeURIComponent(query as string)} | ${SITE_CONFIG.title}`,
    };
  } else {
    return {
      title: `Không tìm kết quả tìm kiếm nào | ${SITE_CONFIG.title}`,
    };
  }
}

export default async function SearchPage() {
  const [categories, countries] = await Promise.all([
    getListCategory(),
    getListCountry(),
  ]);
  return <SearchComponent listDataFilters={{ categories, countries }} />;
}
