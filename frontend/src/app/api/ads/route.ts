import { readFileSync } from "fs";
import { isEmpty } from "lodash";
import path from "path";

export async function GET() {
  // return null;
  let ads = null;

  const filePath = path.join(process.cwd(), "public", "configs", "ads.json");
  const jsonData = readFileSync(filePath, "utf-8");
  ads = JSON.parse(jsonData);

  if (!isEmpty(ads)) {
    return Response.json({
      header: ads?.header || {},
      footer: ads?.footer || {},
      row1: ads?.row1 || {},
      row2: ads?.row2 || {},
      row3: ads?.row3 || {},
      slide: ads?.side || {},
      popup: ads?.popup || {},
      list_app: ads?.list_app || {},
      in_player: ads?.in_player || {},
    });
  }

  return Response.json({
    header: null,
    footer: null,
    row1: null,
    row2: null,
    row3: null,
    slide: null,
    popup: null,
    list_app: null,
    in_player: null,
  });
}
