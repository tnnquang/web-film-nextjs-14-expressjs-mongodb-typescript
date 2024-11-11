import axios from "axios";
import mongoose from "mongoose";
import { isEmpty } from "lodash";
import { writeFileSync } from "fs";

import FilmModel from "../model/film";
import { parseListEpisode, returnFilmObject } from "./utils";
import { downloadAndProcessImage } from "../middleware/downloadAndUploadImage";


const db = mongoose.connection;

async function Update() {
    const query = { total_episode: { $regex: /(\d+)\s*tập/i } };
    const docs = await FilmModel.find(query);
    console.log("length >> ", docs.length);
  
    for (let doc of docs) {
      doc.total_episode = doc.total_episode.split(" ")[0];
      await doc.save();
      console.log(`Đã đổi từ phim >> ${doc.title} <<`);
    }
  
    console.log(`${docs.length} documents were updated.`);
  }
  
  async function UpdateChieuRap() {
    console.log("Dang vao ham, dang tim phim thich hop");
    const query = { "movie.type": "hoathinh" };
    const dataFill = await db
      .collection("crawl-film-fill-diff")
      .find(query)
      .toArray();
    console.log("eeee", dataFill.length);
    for (let item of dataFill) {
      try {
        const film = await FilmModel.findOneAndUpdate(
          { title: item.movie.name },
          { $addToSet: { category: { $each: ["Hoạt Hình"] } } }
        );
        console.log(`Update thành công phim >> ${film?.title}`);
        // Xử lý dữ liệu trả về nếu cần
      } catch (error) {
        console.error(`Error updating film ${item.movie.name}:`, error);
      }
    }
    console.log(
      "Đã hoàn tất cập nhật thông tin loại hoạt hình với >> ",
      dataFill.length,
      " << phim"
    );
  }
  
  async function findNotExistToAdd(
    collectionSource?: string,
    collectionOutput?: string,
    collectionCompare?: string
  ) {
    try {
      const source = collectionSource ?? "crawl-kkphim";
      const output = collectionOutput ?? "fill-diff-kkphim";
      const compare = collectionCompare ?? "crawl-ophim";
      console.log(
        `Tìm kiếm các phim chỉ có trong ${source} mà không có ${collectionCompare}`
      );
      console.log("Đang thực hiện hàm tìm kiếm khác biệt");
      const arrTemp = [];
      const totalItems = await db.collection(source).countDocuments();
      console.log("Tổng item: ", totalItems);
      const pages = Math.ceil(totalItems / 100);
      console.log("Tổng trang: ", pages);
      for (let i = 0; i < pages; i++) {
        console.log(`Đang chạy từ trang ${i + 1} đến ${pages}`);
        const dataListKK = await db
          .collection(source)
          .find()
          .skip(i * 100)
          .limit(100)
          .toArray();
        for (const item of dataListKK) {
          const checked = await db
            .collection(compare)
            .findOne({ "movie.name": item.movie.name });
          if (!checked) {
            arrTemp.push({
              movie: item.movie,
              episodes: item.episodes,
            });
            console.log(`Đã thêm phim >> ${item.movie.name} << vào mảng tạm`);
          } else {
            console.log(`Phim >> ${item.movie.name} << đã tồn tại`);
          }
        }
      }
      await db.collection(output).insertMany(arrTemp);
      console.log(`Hoàn tất thêm tất cả các phim`);
    } catch (error: any) {
      console.log("Lỗi thêm phim: ", error);
    }
  }
  
  async function updateListEpisodes() {
    try {
      const len = await db.collection("crawl-ophim").countDocuments();
      console.log("Độ dài mảng: ", len);
      const totalPages = Math.ceil(len / 100);
      console.log("Tổng số trang: ", totalPages);
      const dataBulkArray = [];
      for (let i = 0; i < totalPages; i++) {
        const dataList = await db
          .collection("crawl-ophim")
          .find({})
          .skip(i * 100)
          .limit(100)
          .toArray();
        for (const item of dataList) {
          try {
            const check = await FilmModel.exists({ title: item.movie.name });
            const newEps = parseListEpisode(item.episodes);
            if (check) {
              const updateOperation = {
                updateOne: {
                  filter: { _id: check._id },
                  update: { $set: { list_episode: newEps } },
                },
              };
              dataBulkArray.push(updateOperation);
              console.log(`Đã thêm cập nhật cho phim >>> ${item.movie.name} <<<`);
            } else {
              const film = await returnFilmObject(item);
              const insertOneOperation = {
                insertOne: {
                  document: film,
                },
              };
              dataBulkArray.push(insertOneOperation);
              console.log("Chờ thêm mới vô DB >> ", item.movie.name);
            }
          } catch (error: any) {
            console.log("Lỗi ở item này >> ", item.movie.name);
            return;
          }
        }
        console.log("Thêm xong trang >> ", i);
      }
  
      await FilmModel.bulkWrite(dataBulkArray as any);
  
      console.log("Đã thay đổi toàn bộ");
    } catch (error: any) {
      console.error("Lỗi trong quá trình cập nhật:", error);
    }
  }
  
  async function updateBLCate() {
    const arrCheck = [
      "Pit Babe The Series",
      "Time the Series",
      "Đêm Khó Quên",
      "For Him",
      "For Him",
      "Tình yêu của Siam",
      "Anh Jade: Người Trung Gian",
      "Oppa Xã Hội Đen Thân Yêu",
      "Bump Up Business: Kế Hoạch Thăng Cấp Idol",
      "Độ Không Tuyệt Đối",
      "Ngăn Bầu Trời Che Lấp Đi Vì Sao",
      "Hương Tình Yêu",
      "Bướng Bỉnh Anh Lại Nghĩ Em Quậy",
      "TharnType The Series 2: Mối Tình 7 Năm",
      "TharnType The Series 1: Từ Ghét Tới Yêu",
      "Khi Trái Tim Gần Nhau",
      "Love in Translation",
      "Tần Số Thấp",
      "Laws of Attraction: Luật Hấp Dẫn",
      "Wedding Plan: Kế Hoạch Yêu Đen Tối Của Chú Rể",
      "Remember Me: Tình Yêu Được Viết Bằng Tình Yêu",
      "Be Mine. Superstar",
      "Dinosaur Love: Tình Yêu Khủng Long",
      "The Yearbook: Sách Kỷ Yếu",
      "I Am Your King 2",
      "I Am Your King 1",
      "La Pluie: Cơn Mưa Khi Ấy, Em Yêu Anh",
      "Chầm Chậm Yêu",
      "Vì Nhớ (ReminderS)",
      "AiNhai",
      "Love Syndrome III",
      "My Blessing",
      "2 Moons The Ambassador",
      "Cutie Pie",
      "Cutie Pie 2 You",
      "Tin Tem Jai The Series",
      "Bed Friend: Đừng Đùa Với Lửa",
      "Xiềng Xích Trái Tim",
      "Nụ Hôn Cuối Chỉ Dành Cho Cậu",
      "Big Dragon The Series",
      "Mộng Hồ Điệp",
      "Cơ Hội Thứ Hai",
      "Di Chúc Của Thần Tình Yêu",
      "Cá Trên Trời",
      "Ai Long Nhai The Series",
      "Check Out Series Uncut Version SP",
      "Dây Dầu Gai (Between Us)",
      "Không Khí Tình Yêu",
      "Xác Suất Tình Yêu 12%",
      "Our Day",
      "Thiên Cực Của Tôi",
      "Triage",
      "What Zabb Man!",
      "Di Chúc Của Thần Cupid",
      "Chàng Candy Của Tôi",
      "Trời Đêm Rực Rỡ",
      "Xấu Xa Lắm Nha, Tình Yêu Của Mafia",
      "Tình Yêu Hoán Đổi Thế Giới",
      "Theo Ý Vì Sao",
      "Even Sun",
      "Love Mechanics",
      "Check Out Series (Đêm Đó Cùng Cậu Sao Bắc Đẩu)",
      "TharnType: Từ ghét tới yêu (Phần 2)",
      "TharnType: Từ ghét tới yêu (Phần 1)",
      "Người Tình Cún Con",
      "Hành Trình Tìm Kiếm Tình Yêu",
      "Hành Trình Tìm Kiếm Tình Yêu",
      "Vì chúng ta vẫn là một đôi",
      "Xin Chào Quái Vật (Bản Thái)",
      "Chú gấu bông kỳ diệu",
      "GEN Y The Series",
      "Tôi Đến Vì Linh Hồn",
      "En of Love",
      "Until We Meet Again",
      "KinnPorsche The Series | Press Conference",
      "Gen Y The Series Phần 2",
      "Thiếu Gia Xã Hội Đen Yêu Tôi (KinnPorsche The Series)",
    ];
    const isNotAvailable: any[] = [];
    const a = arrCheck.map(async (e) => {
      const film = await FilmModel.findOneAndUpdate(
        { title: e },
        { $addToSet: { category: { $each: ["Boy Love"] } } }
      );
      if (!film) {
        isNotAvailable.push(e);
      }
    });
    await Promise.all(a);
    console.log("Chưa có trong DB >> ", JSON.stringify(isNotAvailable));
  }
  
  async function updateTrailer() {
    try {
      const arr = await FilmModel.find({ quality: "Trailer" });
      const arrOperation = [];
      let s = 0;
      for (const film of arr) {
        const item = await db
          .collection("crawl-ophim")
          .findOne({ "movie.name": film.title });
        if (item) {
          const updateOperation = {
            updateOne: {
              filter: { _id: film._id },
              update: { $set: { trailer_url: item.movie.trailer_url } },
            },
          };
          arrOperation.push(updateOperation);
          s++;
        }
      }
      await FilmModel.bulkWrite(arrOperation as any);
      console.log("Update xong");
      console.log("film trung khop la: ", s);
    } catch (error: any) {}
  }
  
  async function crawlYuthanhthien() {
    try {
      const res = await axios.get(
        "https://yuthanhthien.net/api/movie?offset=0&limit=1000"
      );
      const dataList = res.data.movies;
      console.log("Số lượng item: ", dataList.length);
      const dataOperations = [];
      for (const item of dataList) {
        const ress = await axios.get(
          `https://yuthanhthien.net/api/movie/${item.slug}`
        );
        const film = ress.data;
        if (film) {
          const { _id, ...rest } = film;
          // console.log("eeeee", rest)
  
          const insertOneOperation = {
            insertOne: {
              document: rest,
            },
          };
          dataOperations.push(insertOneOperation);
          console.log("Đã thêm phim vào mảng: ", film.title);
        }
      }
      await db.collection("crawl-yuthanhthien").bulkWrite(dataOperations as any);
      console.log("Đã thêm tất cả các phim vào database");
    } catch (error: any) {
      console.log("Error fetching data: ", error);
    }
  }
  
  async function UpdateImages_v2(
    collection?: string,
    batchSize?: number,
    pageNum?: number
  ) {
    try {
      const col = collection ?? "crawl-ophim";
      const sizeLimit = batchSize ?? 100;
      const total = await db.collection(col).countDocuments();
      console.log("Số lượng phần tử: ", total);
      const totalPages = Math.ceil(total / sizeLimit);
      console.log("Số lượng trang: ", totalPages);
  
      const range = pageNum ?? totalPages;
      const errorFiles = [];
  
      for (let i = 61; i < range; i++) {
        console.log(`Đang chạy từ trang ${i + 1} đến trang ${range}`);
        const operations = [];
        const listFilmsPerPage = await db
          .collection(col)
          .find({})
          .skip(i * sizeLimit)
          .limit(sizeLimit)
          .toArray();
        for (const item of listFilmsPerPage) {
          try {
            const thumb = isEmpty(item.movie.thumb_url)
              ? ""
              : await downloadAndProcessImage(item.movie.thumb_url, "thumbnail");
            const poster = isEmpty(item.movie.poster_url)
              ? ""
              : await downloadAndProcessImage(item.movie.poster_url, "poster");
  
            const updateOperate = {
              updateOne: {
                filter: { title: item.movie.name },
                update: { $set: { thumbnail: thumb, poster: poster } },
              },
            };
            operations.push(updateOperate);
          } catch (error) {
            errorFiles.push(item.movie.name);
            console.error(
              `Error processing image for film "${item.movie.name}":`,
              error
            );
          }
        }
        console.log("Đã thêm trang vào mảng ", i + 1);
        await FilmModel.bulkWrite(operations);
        console.log("Đã lưu các thay đổi vào DB với trang thứ >> ", i + 1);
      }
      writeFileSync("error files update image.json", JSON.stringify(errorFiles));
      console.log("Đã cập nhật tất cả hình ảnh thành công");
    } catch (error) {
      console.error("Lỗi trong quá trình cập nhật hình ảnh:", error);
    }
  }
  
  async function findAndDeleteFilmYu() {
    try {
      const listYu = await db.collection("crawl-yuthanhthien").find().toArray();
      
      for (const item of listYu) {
        await FilmModel.findOneAndDelete({ title: item.title });
        console.log(`Deleted film with title: ${item.title}`);
      }
      
      console.log("Deleted All Films that matched");
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }