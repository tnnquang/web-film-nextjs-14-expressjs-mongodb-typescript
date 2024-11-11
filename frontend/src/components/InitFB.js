import { isBrowser } from "@/common/constant";

export function initFacebook() {
  if (isBrowser) {
    const FB = window.FB;
    if (FB) {
      FB.XFBML.parse();
    }
    window.fbAsyncInit = function () {
      FB?.init({
        appId: process.env.NEXT_PUBLIC_FB_APP_ID,
        status: true,
        xfbml: true,
        version: "v2.7", // or v2.6, v2.5, v2.4, v2.3
      });
    };
  }
}
