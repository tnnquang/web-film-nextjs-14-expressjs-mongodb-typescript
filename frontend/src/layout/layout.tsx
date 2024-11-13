import HeaderComponent from "./header";
import FooterComponent from "./footer";
import StyledComponentsRegistry from "@/lib/AntdRegistry";
import { fetchAds, retry } from "@/common/utils";
import CommingSoonComponent from "@/components/FilmComponents/CommingSoon";

import {
  Row1AdsComponent,
  LeftSideAdsComponent,
  RightSideAdsComponent,
  PopupAdsComponent,
  FooterAdsComponent,
} from "@/components/AdsComponents/AdsComponent";
import { listCategoryToShow, listCountryToShow } from "@/configs/menus";
import { revalidatePath } from "next/cache";

export default async function LayoutComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ads] = await Promise.all([retry(fetchAds, "fetchAds()")]);

  revalidatePath("/");
  return (
    <StyledComponentsRegistry>
      <HeaderComponent
        countries={listCountryToShow}
        categories={listCategoryToShow}
        adsHeader={ads?.header}
      />
      <main className="main-container relative mx-auto mt-8 min-h-[100dvh] w-full max-w-[1800px] overflow-x-hidden px-4">
        <section className="ads-top-between-content flex flex-col items-start justify-center gap-4 sm:flex-row sm:gap-8"></section>
        <div className="md-4 relative w-full">
          <Row1AdsComponent dataAds={ads?.row1?.ads_content} />
          <div className="children-wrapper relative z-10 flex items-start gap-2 2lg:mx-[128px]">
            {children}
            <aside className="side-right w-full 2lg:w-fit">
              <div className="comming-soon-films mt-3 h-full 2lg:mt-0">
                <p className="big-title mb-2 border-b-2 border-dashed border-b-[#4660e6] pb-2 text-xl font-semibold uppercase text-white 2lg:mb-6">
                  Phim sắp chiếu
                </p>
                <div className="h-auto w-full 2lg:w-[250px] xl:w-[300px]">
                  <CommingSoonComponent />
                </div>
              </div>
              {/* <div className="comming-soon-films mt-10 h-full">
                <p className="big-title border-b-[#4660e6] pb-2 text-xl font-semibold text-white">
               
                </p>
                <div className="h-auto w-full 2lg:w-[250px] xl:w-[300px]">
                  
                </div>
              </div> */}
            </aside>
          </div>
        </div>
        <div className="fixed left-1/2 top-0 mx-auto hidden h-full w-full max-w-[1800px] -translate-x-1/2 px-4 2lg:block">
          <div className="max-auto w-full">
            <LeftSideAdsComponent dataAds={ads?.slide} />
            <RightSideAdsComponent dataAds={ads?.slide} />
          </div>
        </div>
      </main>
      <FooterComponent />
      <PopupAdsComponent dataAds={ads?.popup?.ads_content} />
      <FooterAdsComponent dataAds={ads?.footer?.ads_content} />
    </StyledComponentsRegistry>
  );
}
