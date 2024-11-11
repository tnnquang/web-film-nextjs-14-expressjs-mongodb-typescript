/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    unoptimized: true,
    // remotePatterns: imageRemotePatterns,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    scrollRestoration: false,
    optimizePackageImports: [
      "react-icons",
      "antd",
      "react-player",
      "@aka_theos/react-hls-player",
      "react-alice-carousel",
      "react-share",
      "sharp",
      "video.js",
      "videojs-contrib-hls",
      "react-toastify",
      "react-tooltip",
      "lodash",
      "axios",
      "@mui/material",
    ],
  },
  // typescript: {
  //   // !! WARN !!
  //   // Dangerously allow production builds to successfully complete even if
  //   // your project has type errors.
  //   // !! WARN !!
  //   ignoreBuildErrors: true,
  // }
};

module.exports = withBundleAnalyzer(nextConfig);
