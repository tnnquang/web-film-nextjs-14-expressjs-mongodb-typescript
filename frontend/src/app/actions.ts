"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export default async function action() {
  revalidateTag("list-film-tab-category");
  revalidateTag("list-film-cartoon");
  revalidateTag("list-film-custom");
  revalidateTag("watch-film");
  revalidateTag("hot-film");
  revalidateTag("comming-soon");
  revalidateTag("get-comment");
  revalidateTag("phim-tinh-cam");

  revalidatePath("/");
}
