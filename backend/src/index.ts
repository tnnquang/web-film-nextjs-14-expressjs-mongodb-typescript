import { isEmpty } from "lodash";
// import mongoose from "mongoose";

import { schedule } from "node-cron";

import FilmModel from "./model/film";
import server from "./config/server";
import { PORT } from "./common/config";
import connectDatabase from "./config/db";
import {
  checkAndCrawlFromKKPhim,
  checkAndCrawlFromNguonC,
  checkAndCrawlFromOPhim,
} from "./crawl";
import { convertAlphabetToSlug, convertToSlug } from "./common/utils";
import filmCategory from "./model/filmCategory";
import country from "./model/country";

const CONFIG_PORT = PORT || 3000;

function cronJob() {
  // Lập lịch chạy hàm checkAndCrawlFromOPhim mỗi 15 phút
  schedule("*/15 * * * *", async () => {
    console.log("Chạy hàm checkAndCrawlFromOPhim mỗi 15 phút");
    await checkAndCrawlFromOPhim(1, 10);
  });
  schedule("*/25 * * * *", async () => {
    console.log("Chạy hàm checkAndCrawlFromKKPhim mỗi 25 phút");
    await checkAndCrawlFromKKPhim(1, 20);
  });
  schedule("*/45 * * * *", async () => {
    console.log("Chạy hàm checkAndCrawlFromNguonC mỗi 45 phút");
    await checkAndCrawlFromNguonC(1, 10);
  });

  schedule("*/60 * * * *", async () => {
    console.log("Update những phim là trailer nhưng list link là chuỗi rỗng");
    await FilmModel.updateMany(
      { quality: "Trailer", "list_episode.list_link.link": "" },
      { $set: { list_episode: [] } }
    );
  });

  schedule("*/60 * * * *", async () => {
    console.log("Update những phim có dữ liệu nhưng quality là trailer");
    await FilmModel.updateMany(
      {
        quality: "Trailer",
        $and: [
          { list_episode: { $ne: [] } },
          { "list_episode.list_link.link": { $ne: "" } },
        ],
      },
      { $set: { quality: "HD Vietsub" } }
    );
  });

  schedule("*/25 * * * *", async () => {
    console.log("Chạy update lại slug bị lỗi mỗi 25 phút");
    await updateIncorrectSlugs();
  });
}

async function updateIncorrectSlugs() {
  try {
    // Tìm tất cả các slug có chứa ký tự không hợp lệ (ví dụ như ! hoặc ký tự đặc biệt)
    const posts = await FilmModel.find({ slug: /[^a-zA-Z0-9-]/ });

    // Lặp qua từng document và cập nhật lại slug đúng
    for (let post of posts) {
      // Tạo slug mới bằng cách sử dụng hàm convertToSlug hoặc convertAlphabetToSlug
      const newSlug = convertAlphabetToSlug(post.title); // Bạn có thể lấy slug từ title hoặc trường khác

      // Cập nhật slug trong database
      post.slug = newSlug;

      // Lưu lại thay đổi
      try {
        await post.save();
      } catch (error) {
        console.log("Có lỗi xảy ra khi cập nhật slug:", error);
      }
    }

    console.log("Cập nhật slug thành công!");
  } catch (err) {
    console.error("Có lỗi xảy ra:", err);
  }
}

async function startServer() {
  await connectDatabase();

  await new Promise((resolve) => {
    server.listen(CONFIG_PORT, () => {
      console.log(`Server đang chạy trên cổng ${CONFIG_PORT}`);
      resolve(true);
    });
  });

  const countries = await country.find();
  for (const country of countries) {
    country.slug = convertAlphabetToSlug(country.name);
    await country.save();
  }

  //Gọi hàm để cập nhật slug
  // updateIncorrectSlugs();
  // cronJob()

  // const cursor = FilmModel.find().cursor();

  // await cursor.eachAsync(async (doc) => {
  //   // console.log("dcoccccccccc", JSON.stringify(doc["list_episode"]));
  //   // return
  //   try {
  //     if (isEmpty(doc.total_episode)) {
  //       doc.total_episode = "Chưa xác định";
  //     }
  //     const listEps = doc.list_episode;
  //     for (const server of listEps) {
  //       for (const eps of server.list_link) {
  //         if (!isEmpty(eps.title)) {
  //           const slug = eps.title?.trim().toLowerCase().includes("tập")
  //             ? convertAlphabetToSlug(
  //                 `${eps.title.trim()} ${server.name.trim()}`
  //               )
  //             : convertAlphabetToSlug(
  //                 `tập ${eps.title!.trim()} ${server.name.trim()}`
  //               );
  //           eps.slug = slug;

  //           await doc.save();
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.log(
  //       "Error",
  //       error,
  //       "item name >> ",
  //       doc.title,
  //       "<< item total episode >> ",
  //       doc.total_episode
  //     );
  //   }
  // });
  // console.log("Update slug thành công");
  // cronJob();
}

(async function () {
  await startServer();
})();
