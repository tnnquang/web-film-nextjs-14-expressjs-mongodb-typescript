import type { Metadata } from "next";

import NextTopLoader from "nextjs-toploader";
import { ToastContainer } from "react-toastify";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

import LayoutComponent from "@/layout/layout";
import { BASE_URL_FRONTEND, KEYWORDS } from "@/common/constant";
import env from "../../env.json";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import "react-alice-carousel/lib/alice-carousel.css";
import { SITE_CONFIG } from "@/configs/metadata-config";
// import { Suspense } from "react";
// import Spinner from "@/components/Spinner";

export const metadata: Metadata = {
  title: SITE_CONFIG.home,
  description: SITE_CONFIG.description,
  keywords: KEYWORDS,
  icons: SITE_CONFIG.icon,
  metadataBase: new URL(BASE_URL_FRONTEND),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <NextTopLoader color="#fff" />
        <LayoutComponent>{children}</LayoutComponent>
        <div id="fb-root"></div>
        {/* {process.env.GOOGLE_TAG_MANAGER && (
          <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER as string} />
        )}
        {process.env.GOOGLE_TAG_MANAGER2 && (
          <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER2 as string} />
        )}
        {process.env.GOOGLE_ANALYTIC && (
          <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTIC as string} />
        )} */}

        <GoogleTagManager gtmId={env.GOOGLE_TAG_MANAGER} />
        <GoogleAnalytics gaId={env.GOOGLE_ANALYTIC} />
        <ToastContainer position="top-center" />
      </body>
    </html>
  );
}
