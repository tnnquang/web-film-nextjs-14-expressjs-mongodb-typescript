import { fetchAds, retry } from "@/common/utils";
import {
  Row1AdsComponent,
  Row2AdsComponent,
  Row3AdsComponent,
} from "@/components/AdsComponents/AdsComponent";
import TabCategoryFilmComponent from "@/components/FilmComponents/TabCategoryFilm";
import ListShowListItemWithAnyCategoryComponent from "@/components/FilmComponents/ListShowListItemWithAnyCategoryComponent";

// import configItemDisplayedInHomePage from "@/configs/pageShowData.json";
import React from "react";
import { revalidatePath } from "next/cache";
import { readFileSync } from "fs";
import path from "path";

type Props = {
  searchParams: { [key: string]: string | string[] | null | undefined };
};

async function getFile() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "configs",
    "pageShowData.json"
  );
  const jsonData = readFileSync(filePath, "utf-8");
  const configItemDisplayedInHomePage = JSON.parse(jsonData);
  revalidatePath("/");
  return configItemDisplayedInHomePage;
}

export default async function Home({ searchParams }: Props) {
  const tab = searchParams.tab;
  const [ads, configItemDisplayedInHomePage] = await Promise.all([
    retry(fetchAds, "fetchAds()"),
    retry(getFile, "getFile()"),
  ]);

  revalidatePath("/");

  return (
    <section className="main-page home-page mx-auto w-full">
      <TabCategoryFilmComponent tab={tab as string} />
      {/* <Row1AdsComponent dataAds={ads?.row1?.ads_content} /> */}

      {configItemDisplayedInHomePage
        .filter((e: any) => e.page === "Home")[0]
        ?.listItemWillBeDisplayed.map(async (item: any, index: number) =>
          index === 0 ? (
            <React.Fragment key={index}>
              <Row1AdsComponent dataAds={ads?.row1?.ads_content} />
              <ListShowListItemWithAnyCategoryComponent
                title={item?.title}
                categorySlug={item?.categoryPath}
                categoryName={item?.categoryName}
              />
            </React.Fragment>
          ) : index === 1 ? (
            <React.Fragment key={index}>
              <Row2AdsComponent dataAds={ads?.row2?.ads_content} />
              <ListShowListItemWithAnyCategoryComponent
                title={item?.title}
                categorySlug={item?.categoryPath}
                categoryName={item?.categoryName}
              />
            </React.Fragment>
          ) : (
            <>
              <Row3AdsComponent dataAds={ads?.row3?.ads_content} />
              <ListShowListItemWithAnyCategoryComponent
                key={index}
                title={item?.title}
                categorySlug={item?.categoryPath}
                categoryName={item?.categoryName}
              />
            </>
          )
        )}
    </section>
  );
}
