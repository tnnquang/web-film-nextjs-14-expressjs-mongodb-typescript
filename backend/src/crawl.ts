// Viết hàm crawl dữ liệu phim từ các host như nguonc, kkphim, ophim, yuthanhthien (phim đam mỹ)
// Sau khi crawl thì tiến hành kiểm tra xem trong DB đã có film với tên đó chưa
// Nếu có rồi thì tiến hành update lại các trường:
// + Nếu status !=trailer -> xoá quality Trailer, thay bằng quality= movie.quality + movie.lang
// + Cập nhật lại số tập phim
// - Nếu chưa có phim trong DB thì tiến hành thêm phim bình thường vào DB
// Ok, let's go

import axios from "axios";

import FilmModel from "./model/film";
import {
  formatCategoryFromKKPhimOphim,
  parseListEpisode,
  parseListEpisodeYuthanhthien,
  returnFilmObject,
  returnFilmObjectForYuthanhthien,
  returnFilmObjectFromNguonC,
  sleep,
} from "./common/utils";
import { isEmpty } from "lodash";

const fetchOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // Timeout 10 giây
};

// async function handleListPageFilm(dataList: any[], page: number) {
//   try {
//     const operationsArray = [];
//     console.log("Bắt đầu chạy vòng lặp để thêm/chỉnh sửa thông tin phim");
//     for (const data of dataList) {
//       try {
//         const checkExist = await FilmModel.findOne({
//           title: data.movie.name.trim(),
//         });
//         if (checkExist) {
//           const episodesData = !isEmpty(data.episodes)
//             ? data.episodes[0].server_data
//             : data.movie.episodes[0]["items"];

//           if (
//             (checkExist.quality === "Trailer" &&
//               data.movie.status !== "trailer") ||
//             isEmpty(checkExist.list_episode) ||
//             episodesData?.length > checkExist.list_episode[0].list_link.length
//           ) {
//             const listEps = parseListEpisode(
//               data.episodes ?? data.movie.episodes
//             );
//             const totalEps = (
//               data.movie.episode_total ?? data.movie.total_episodes.toString()
//             ).startsWith("?")
//               ? "?"
//               : data.movie.episode_total ??
//                 data.movie.total_episodes.toString();

//             const updateOperation = {
//               updateOne: {
//                 filter: { title: data.movie.name },
//                 update: {
//                   $set: {
//                     quality: `${data.movie.quality} ${data.movie.lang ?? data.movie.language}`,
//                     list_episode: listEps,
//                     total_episode: totalEps,
//                   },
//                 },
//                 //   upsert: true,
//               },
//             };
//             operationsArray.push(updateOperation);
//             console.log("Sửa thông tin phim >> ", checkExist.title);
//           }
//         } else {
//           const film = await returnFilmObject(data);
//           const insertOperation = {
//             insertOne: {
//               document: film,
//             },
//           };
//           operationsArray.push(insertOperation);
//           console.log("Thêm mới phim >> ", film.title);
//         }
//       } catch (error: any) {
//         console.log("Lỗi ở phim này: ", data.movie.name, error);
//         // break
//       }
//     }

//     if (operationsArray.length > 0) {
//       try {
//         await FilmModel.bulkWrite(operationsArray);
//         operationsArray.splice(0, operationsArray.length); // Xóa hết dữ liệu trong mảng
//         dataList.splice(0, dataList.length); // Xóa hết dữ liệu trong mảng
//         console.log("Đã thêm/cập nhật toàn bộ các phim của trang >>> ", page);
//       } catch (error: any) {
//         console.log("Bulk write bị lỗi ở trang >>> ", page, error);
//       }
//     }
//   } catch (error: any) {
//     console.log(
//       "Lỗi xử lý mảng phim của trang >> ",
//       page,
//       error?.message ?? error
//     );
//   }
// }

async function handleListPageFilm(
  dataList: any[],
  page: number,
  source: string
) {
  try {
    const operationsArray = [];
    console.log("Bắt đầu chạy vòng lặp để thêm/chỉnh sửa thông tin phim");
    for (const data of dataList) {
      try {
        const name = data.movie.name.trim();

        const checkExist = await FilmModel.findOne({ title: name });

        if (checkExist) {
          let categories: string[] = formatCategoryFromKKPhimOphim(
            data?.movie?.category,
            data
          );
          if(checkExist.category?.includes("Phim Chiếu Rạp")){
            categories.push("Phim Chiếu Rạp")
          }

          const episodesData = !isEmpty(data.episodes)
            ? data.episodes[0].server_data
            : [];
          if (
            data.movie.status === "trailer" &&
            checkExist.quality !== "Trailer"
          ) {
            const updateOperation = {
              updateOne: {
                filter: { title: data.movie.name },
                update: {
                  $set: {
                    quality: "Trailer",
                    category: categories,
                    trailer_url: data.movie.trailer_url || "",
                  },
                },
              },
            };
            operationsArray.push(updateOperation);
          } else {
            const currentEp =
              checkExist?.list_episode[0]?.list_link?.filter(
                (e) => !isEmpty(e.link)
              ).length || 0;
            if (
              isEmpty(checkExist.list_episode) ||
              episodesData?.length > currentEp
            ) {
              const listEps = parseListEpisode(
                data.episodes ?? data.movie.episodes
              );
              const totalEps = (
                data.movie.episode_total ?? data.movie.total_episodes.toString()
              ).startsWith("?")
                ? "?"
                : data.movie.episode_total ??
                  data.movie.total_episodes.toString();

              const updateOperation = {
                updateOne: {
                  filter: { title: name },
                  update: {
                    $set: {
                      quality: `${data.movie.quality} ${data.movie.lang || data.movie.language}`,
                      category: categories,
                      list_episode: listEps,
                      total_episode: totalEps,
                    },
                  },
                  //   upsert: true,
                },
              };
              operationsArray.push(updateOperation);
              console.log("Sửa thông tin phim >> ", checkExist.title);
            }
          }
        } else {
          const film = await returnFilmObject(data, source);
          const insertOperation = {
            insertOne: {
              document: film,
            },
          };
          operationsArray.push(insertOperation);
          console.log("Thêm mới phim >> ", film.title);
        }
      } catch (error: any) {
        console.log("Lỗi ở phim này: ", data.movie.name, error);
        // break
      }
      // await sleep(500);
    }

    // writeFileSync(
    //   __dirname + "data_page_" + page + ".json",
    //   JSON.stringify(operationsArray, null, 2)
    // );

    if (operationsArray && operationsArray.length > 0) {
      try {
        await FilmModel.bulkWrite(operationsArray);
        operationsArray.splice(0, operationsArray.length); // Xóa hết dữ liệu trong mảng
        dataList.splice(0, dataList.length); // Xóa hết dữ liệu trong mảng
        console.log("Đã thêm/cập nhật toàn bộ các phim của trang >>> ", page);
      } catch (error: any) {
        console.log(`Trang ${page} bị lỗi khi thực hiện thao tác bulkwrite`);
      }
    }
  } catch (error: any) {
    console.log(
      "Lỗi xử lý mảng phim của trang >> ",
      page,
      error?.message ?? error
    );
  }
}

async function handleListPageFilmNguonC(dataList: any[], page: number) {
  try {
    const operationsArray = [];
    console.log("Bắt đầu chạy vòng lặp để thêm/chỉnh sửa thông tin phim");
    for (const data of dataList) {
      try {
        const checkExist = await FilmModel.findOne({ title: data.movie.name }).lean();
        let categories:any;
        if (checkExist) {
          const category: any = data?.movie?.category;
          if (!isEmpty(category)) {
            const lstCate: any = Object.values(category).find(
              (el: any) => el.group.name === "Thể loại"
            );
            if (!isEmpty(lstCate)) {
              const lst = lstCate.list as any[];
              categories = formatCategoryFromKKPhimOphim(lst, data);
              if(checkExist.category.includes("Phim Chiếu Rạp")){
                categories.push("Phim Chiếu Rạp")
              }
            }
          }
          if (
            data.movie.current_episode === "Trailer" &&
            checkExist.quality !== "Trailer"
          ) {
            const operation = {
              updateOne: {
                filter: { title: data.movie.name },
                update: {
                  $set: {
                    quality: "Trailer",
                    trailer_url: data?.movie?.trailer_url || "",
                  },
                },
              },
            };
            operationsArray.push(operation);
          } else {
            if (!isEmpty(data.movie.episodes)) {
              const currentEp =
                checkExist.list_episode[0].list_link.filter(
                  (e) => !isEmpty(e.link)
                ).length || 0;
              const episodesData = data.movie.episodes[0]["items"];
              if (
                isEmpty(checkExist.list_episode) ||
                episodesData?.length > currentEp
              ) {
                const listEps = parseListEpisode(data.movie.episodes);
                const totalEps = data.movie.total_episodes.toString();

                const updateOperation = {
                  updateOne: {
                    filter: { title: data.movie.name },
                    update: {
                      $set: {
                        quality: `${data.movie.quality} ${data.movie.language || ""}`,
                        list_episode: listEps,
                        total_episode: totalEps,
                        category: categories,
                      },
                    },
                    //   upsert: true,
                  },
                };
                operationsArray.push(updateOperation);
                console.log("Sửa thông tin phim >> ", checkExist.title);
              }
            }
          }
        } else {
          const film = await returnFilmObjectFromNguonC(data);
          const insertOperation = {
            insertOne: {
              document: film,
            },
          };
          operationsArray.push(insertOperation);
          console.log("Thêm mới phim >> ", film.title);
        }

        // if (checkExist) {
        //   let categories: string[] = [];
        //   if (
        //     !isEmpty(data?.movie?.category) &&
        //     Array.isArray(data?.movie?.category) &&
        //     data?.movie?.category.length > 0
        //   ) {
        //     categories = data?.movie?.category.map(
        //       (e: { id: string; name: string }) => {
        //         const capitalize = toCapitalize(e.name.trim());
        //         if (
        //           e.name.trim() === "Giả Tượng" ||
        //           e.name.trim() === "Viễn Tượng"
        //         ) {
        //           return "Viễn Tưởng";
        //         } else if (
        //           e.name.trim() === "Hài" ||
        //           e.name.trim() === "Phim Hài"
        //         ) {
        //           return "Hài Hước";
        //         } else if (
        //           e.name.trim() === "Nhạc" ||
        //           e.name.trim() === "Phim Nhạc"
        //         ) {
        //           return "Âm Nhạc";
        //         } else if (e.name.trim() === "Chương Trình Truyền Hình") {
        //           return "TV Shows";
        //         }
        //         return capitalize;
        //       }
        //     );
        //   } else {
        //     categories = [];
        //   }
        //   const updateOperation = {
        //     updateOne: {
        //       filter: { title: data.movie.name },
        //       update: {
        //         $set: {
        //           category: categories,
        //         },
        //       },
        //     },
        //   };
        //   operationsArray.push(updateOperation);
        // }
      } catch (error: any) {
        console.log("Lỗi ở phim này: ", data.movie.name, error);
        // break
      }
    }

    // writeFileSync(
    //   __dirname + "data_page_" + page + ".json",
    //   JSON.stringify(operationsArray, null, 2)
    // );

    if (operationsArray && operationsArray.length > 0) {
      try {
        await FilmModel.bulkWrite(operationsArray);
        operationsArray.splice(0, operationsArray.length); // Xóa hết dữ liệu trong mảng
        dataList.splice(0, dataList.length); // Xóa hết dữ liệu trong mảng
        console.log("Đã thêm/cập nhật toàn bộ các phim của trang >>> ", page);
      } catch (error: any) {
        console.log(`Trang ${page} bị lỗi khi thực hiện thao tác bulkwrite`);
      }
    }
  } catch (error: any) {
    console.log(
      "Lỗi xử lý mảng phim của trang >> ",
      page,
      error?.message ?? error
    );
  }
}

export async function crawlOPhimKKPhimFromListSlug(
  list: string[],
  kkphim = true
) {
  console.log(
    "Bat dau cao du lieu tu danh sach slug >> so luong phan tu: ",
    list.length
  );
  const uri = kkphim ? "https://phimapi.com/phim" : "https://ophim1.com/phim";
  try {
    const dataList = [];
    const listFilmError = [];
    for (const slug of list) {
      try {
        console.log("Vòng lặp list film để get chi tiết phim ");
        const res = await fetch(`${uri}/${slug}`, fetchOptions);
        if (res.ok) {
          const jsonData = await res.json();

          if (jsonData.movie) {
            console.log("Đã get xong chi tiết phim >> ", slug);
            dataList.push(jsonData);
          }
        } else {
          listFilmError.push(slug);
          console.log("Get chi tiết phim bị lỗi với phim >> ", slug);
        }
        // console.log("Đã thêm phim vào mảng dataList");
      } catch (error: any) {
        listFilmError.push(slug);
        console.log(
          "Get chi tiết phim bị lỗi với phim >> ",
          slug,
          error.message
        );
      }
      await sleep(500);
    }
    console.log("Thêm hoàn tất thêm vào mảng tạm danh sách slug");
    try {
      console.log(
        "Tiến hành xử lí danh sách dữ liệu phim bị lỗi và đã get xong"
      );
      await handleListPageFilm(dataList, 1, kkphim ? "KKPhim" : "OPhim");
    } catch (error) {
      console.log(
        "Xử lí danh sách dữ liệu phim bị lỗi và đã get xong bị lỗi handleListPageFilm: ",
        error
      );
      console.log("Tiến hành xử lí lại handleListPageFilm");
      await handleListPageFilm(dataList, 1, kkphim ? "KKPhim" : "OPhim");
    }
    if (listFilmError.length > 0) {
      console.log(
        "List get phim bi loi: ",
        listFilmError.length,
        "Dang chay lai de xu li list error"
      );
      try {
        console.log("Tiến hành cào dữ liệu từ list slug lỗi của list slug");
        await crawlOPhimKKPhimFromListSlug(listFilmError);
      } catch (error) {
        console.log(
          "Cào dữ liệu từ list slug lỗi của list slug bị lỗi, sẽ tiến hành lại >> ",
          error
        );
        await crawlOPhimKKPhimFromListSlug(listFilmError);
      }
    }
  } catch (error) {
    console.log(
      "Loi khi xu li danh sach phim ham crawlDataNguonCFromListSlug: ",
      error,
      "Dang tien hanh goi lai ham xu li"
    );
    await crawlOPhimKKPhimFromListSlug(list);
  }
}

export async function getPageListFromOphim(
  dataList: any[],
  listFilmError: any[],
  i: number
) {
  const ress = await fetch(
    `https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${i}`,
    fetchOptions
  ).then((value) => value.json());
  console.log("Lấy xong thông tin list phim >> ", i);
  const data = ress.items;
  // vòng lặp lấy dữ liệu chi tiết từng phim rồi lưu lại trong mảng
  for (const item of data) {
    try {
      console.log("Vòng lặp list film để get chi tiết phim ");
      const res = await fetch(
        `https://ophim1.com/phim/${item.slug.trim()}`,
        fetchOptions
      );

      if (res.ok) {
        let jsonData: any;
        try {
          jsonData = await res.json();
        } catch (error) {
          console.log("error for parse json fron response fetched: ", error);
        }

        console.log("Đã get xong chi tiết phim >> ", item.name);
        dataList.push(jsonData);
      } else {
        if (res.status !== 404) {
          console.log(
            "Get chi tiết phim bị lỗi.Thêm vào mảng lỗi để gọi lại >> không phải mã lỗi 404 >> ",
            item.name
          );
          listFilmError.push(item.slug);
        } else {
          console.log(
            "Get chi tiết phim bị lỗi do server trả về mã 404. Không thêm vào mảng lỗi để chạy lại >> ",
            item.name
          );
        }
      }
      // console.log("Đã thêm phim vào mảng dataList");
    } catch (error: any) {
      listFilmError.push(item.slug);
      console.log(
        "Get chi tiết phim bị lỗi với phim >> ",
        item.name,
        error.message
      );
    }
  }
  console.log("Thêm hoàn tất thêm vào mảng tạm trang: ", i);
  try {
    await handleListPageFilm(dataList, i, "OPhim");
  } catch (error) {
    console.log(
      "Loi khi di vao ham handleListPageFilm de xu li du lieu trang phim: ",
      error
    );
    console.log("Tien hanh xu li lai ham handleListPageFilm voi trang >> ", i);
    await handleListPageFilm(dataList, i, "OPhim");
  }
}

export async function checkAndCrawlFromOPhim(
  startPage = 1,
  endPage = 50,
  all = false
) {
  console.log("|-------- CRAWL DỮ LIỆU PHIM TỪ OPHIM ---------|");
  try {
    //Khởi chạy từ trang start đến trang end, mặc định start là 1, end là 50
    // tức là crawl dữ liệu từ trang 1 tới trang 50 đối với ổ phim
    const response = await fetch(
      "https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1",
      fetchOptions
    ).then((value) => value.json());
    console.log("Lấy xong thông tin tổng trang >> ");
    const totalPages = response.pagination.totalPages;
    const start = +startPage ?? 1;
    const end = all ? +totalPages : +endPage > +totalPages ? 50 : endPage;

    console.log("Start page, end page >> ", start, end);

    //Tạo biến lưu trữ dữ liệu chi tiêt của từng phim

    const listFilmError: any[] = [];
    // vòng lặp chạy từ start đến end để get dữ liệu từng trang thông tin phim
    for (let i = start; i <= end; i++) {
      const dataList: any[] = [];
      // get dữ liệu từng trang thông tin phim
      try {
        await getPageListFromOphim(dataList, listFilmError, i);
      } catch (error) {
        console.log("Lấy dữ trang phim bị lỗi: ", i, error);
        console.log("Tiến hành xử lí lại lấy dữ liệu phim theo trang >> ", i);
        try {
          await getPageListFromOphim(dataList, listFilmError, i);
        } catch (error) {
          await getPageListFromOphim(dataList, listFilmError, i);
        }
      }
    }

    if (listFilmError.length > 0) {
      try {
        console.log("Tiến hành chạy danh sách slug bị lỗi");
        await crawlOPhimKKPhimFromListSlug(listFilmError, false);
      } catch (error) {
        console.log(
          "Bị lỗi khi cố gắng get lại những slug phim bị lỗi. Tiến hành lại >> ",
          error
        );
        await crawlOPhimKKPhimFromListSlug(listFilmError, false);
      }
      // const filePath = join(__dirname, "list kkphim error.json");
      // writeFileSync(filePath, JSON.stringify(listFilmError, null, 2));
      // console.log("Đã tạo file danh sách phim get bị lỗi");
      // listFilmError.splice(0, listFilmError.length); // Xóa hết dữ liệu trong mảng
    }
  } catch (error: any) {
    console.log("Lỗi khi thư hiện thao tác bulkWrite: ", error);
  }
}

export async function checkAndCrawlFromOPhim_v2(
  startPage = 1,
  endPage = 50,
  all = false
) {
  console.log("|-------- CRAWL DỮ LIỆU PHIM TỪ OPHIM ---------|");
  try {
    const dataList: any[] = [];

    // Sử dụng Promise.all và mảng map để tối ưu hóa việc gửi yêu cầu HTTP
    await Promise.all(
      Array.from({ length: endPage - startPage + 1 }, (_, i) =>
        axios.get(
          `https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${startPage + i}`,
          { timeout: 5000 }
        )
      )
    ).then((responses) => {
      responses.forEach((res) => {
        const data = res.data;
        for (const item of data.items) {
          dataList.push(axios.get(`https://ophim1.com/phim/${item.slug}`));
        }
      });
    });

    const operationsArray: any[] = [];

    // Sử dụng Promise.all để chờ tất cả các yêu cầu HTTP hoàn thành
    await Promise.all(dataList).then((responses) => {
      responses.forEach(async (res) => {
        const data = res.data;
        const checkExist = await FilmModel.findOne({ title: data.movie.name }).lean();
        if (checkExist) {
          if (
            checkExist.quality === "Trailer" &&
            data.movie.status !== "trailer"
          ) {
            const listEps = parseListEpisode(data.episodes);
            const totalEps = (data.movie.episode_total as string).startsWith(
              "?"
            )
              ? "?"
              : data.movie.episode_total;
            const updateOperation = {
              updateOne: {
                filter: { title: data.movie.name },
                update: {
                  $set: {
                    quality: `${data.movie.quality} ${data.movie.lang}`,
                    list_episode: listEps,
                    total_episode: totalEps,
                  },
                },
              },
            };
            operationsArray.push(updateOperation);
            console.log("Thêm mới phim từ Ổ Phim >> ", checkExist.title);
          }
        } else {
          const film = await returnFilmObject(data, "OPhim");
          const insertOperation = {
            insertOne: {
              document: film,
            },
          };
          operationsArray.push(insertOperation);
          console.log("Thêm mới phim từ Ổ Phim >> ", film.title);
        }
      });
    });

    await FilmModel.bulkWrite(operationsArray);
    console.log("Đã thêm/cập nhật toàn bộ các phim");
  } catch (error: any) {
    console.log("Lỗi khi thực hiện thao tác bulkWrite: ", error?.message);
  }
}

export async function checkAndCrawlFromOPhim_v3(
  startPage = 1,
  endPage = 50,
  all = false
) {
  try {
    const dataList: any[] = [];

    // Sử dụng Promise.allSettled và mảng map để tối ưu hóa việc gửi yêu cầu HTTP
    const results = await Promise.allSettled(
      Array.from({ length: endPage - startPage + 1 }, (_, i) =>
        fetch(
          `https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${startPage + i}`,
          fetchOptions
        )
      )
    );

    results.forEach(async (result) => {
      if (result.status === "fulfilled") {
        const data = await result.value.json();
        for (const item of data.items) {
          dataList.push(
            fetch(`https://ophim1.com/phim/${item.slug}`, fetchOptions)
          );
        }
      } else if (result.status === "rejected") {
        console.log("Lỗi khi lấy dữ liệu trang", result.reason.message);
      }
    });

    const operationsArray: any[] = [];

    // Sử dụng Promise.all để chờ tất cả các yêu cầu HTTP hoàn thành
    await Promise.all(dataList).then((responses) => {
      responses.forEach(async (res) => {
        const data = await res.json();
        const checkExist = await FilmModel.findOne({ title: data.movie.name }).lean();
        if (checkExist) {
          if (
            checkExist.quality === "Trailer" &&
            data.movie.status !== "trailer"
          ) {
            const listEps = parseListEpisode(data.episodes);
            const totalEps = (
              data.movie.episode_total ?? `${data.movie.total_episodes}`
            ).startsWith("?")
              ? "?"
              : data.movie.episode_total ?? data.movie.total_episodes;
            const updateOperation = {
              updateOne: {
                filter: { title: data.movie.name },
                update: {
                  $set: {
                    quality: `${data.movie.quality} ${data.movie.lang}`,
                    list_episode: listEps,
                    total_episode: totalEps,
                  },
                },
              },
            };
            operationsArray.push(updateOperation);
            console.log(
              "Update thông tin phim từ Ổ Phim >> ",
              checkExist.title
            );
          }
        } else {
          const film = await returnFilmObject(data, "OPhim");
          const insertOperation = {
            insertOne: {
              document: film,
            },
          };
          operationsArray.push(insertOperation);
          console.log("Thêm mới phim từ Ổ Phim >> ", film.title);
        }
      });
    });

    await FilmModel.bulkWrite(operationsArray);
    console.log("Đã thêm/cập nhật toàn bộ các phim");
  } catch (error: any) {
    console.log("Lỗi khi thực hiện thao tác bulkWrite: ", error?.message);
  }
}

export async function getPageListFromKKPhim(
  dataList: any[],
  listFilmError: any[],
  i: number
) {
  const ress = await fetch(
    `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${i}`,
    fetchOptions
  ).then((value) => value.json());
  console.log("Lấy xong thông tin list phim >> ", i);
  const data = ress.items;
  // vòng lặp lấy dữ liệu chi tiết từng phim rồi lưu lại trong mảng
  for (const item of data) {
    try {
      console.log("Vòng lặp list film để get chi tiết phim ");
      const res = await fetch(
        `https://phimapi.com/phim/${item.slug.trim()}`,
        fetchOptions
      );

      if (res.ok) {
        let jsonData: any;
        try {
          jsonData = await res.json();
        } catch (error) {
          console.log("error for parse json fron response fetched: ", error);
        }

        console.log("Đã get xong chi tiết phim >> ", item.name);
        dataList.push(jsonData);
      } else {
        if (res.status !== 404) {
          console.log(
            "Get chi tiết phim bị lỗi.Thêm vào mảng lỗi để gọi lại >> không phải mã lỗi 404 >> ",
            item.name
          );
          listFilmError.push(item.slug);
        } else {
          console.log(
            "Get chi tiết phim bị lỗi do server trả về mã 404. Không thêm vào mảng lỗi để chạy lại >> ",
            item.name
          );
        }
      }
      // console.log("Đã thêm phim vào mảng dataList");
    } catch (error: any) {
      listFilmError.push(item.slug);
      console.log(
        "Get chi tiết phim bị lỗi với phim >> ",
        item.name,
        error.message
      );
    }
  }
  console.log("Thêm hoàn tất thêm vào mảng tạm trang: ", i);
  try {
    await handleListPageFilm(dataList, i, "KKPhim");
  } catch (error) {
    console.log(
      "Loi khi di vao ham handleListPageFilm de xu li du lieu trang phim: ",
      error
    );
    console.log("Tien hanh xu li lai ham handleListPageFilm voi trang >> ", i);
    await handleListPageFilm(dataList, i, "KKPhim");
  }
}

export async function checkAndCrawlFromKKPhim(
  startPage = 1,
  endPage = 50,
  all = false
) {
  console.log("|-------- CRAWL DỮ LIỆU PHIM TỪ KKPHIM ---------|");
  try {
    //Khởi chạy từ trang start đến trang end, mặc định start là 1, end là 50
    // tức là crawl dữ liệu từ trang 1 tới trang 50 đối với ổ phim
    const response = await fetch(
      "https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1",
      fetchOptions
    ).then((value) => value.json());
    console.log("Lấy xong thông tin tổng trang >> ");
    const totalPages = response.pagination.totalPages;
    const start = +startPage ?? 1;
    const end = all ? +totalPages : +endPage > +totalPages ? 50 : endPage;

    console.log("Start page, end page >> ", start, end);

    //Tạo biến lưu trữ dữ liệu chi tiêt của từng phim

    const listFilmError: any[] = [];
    // vòng lặp chạy từ start đến end để get dữ liệu từng trang thông tin phim
    for (let i = start; i <= end; i++) {
      const dataList: any[] = [];
      // get dữ liệu từng trang thông tin phim
      try {
        await getPageListFromKKPhim(dataList, listFilmError, i);
      } catch (error) {
        console.log("Lấy dữ trang phim bị lỗi: ", i, error);
        console.log("Tiến hành xử lí lại lấy dữ liệu phim theo trang >> ", i);
        await getPageListFromKKPhim(dataList, listFilmError, i);
      }
    }

    if (listFilmError.length > 0) {
      try {
        console.log("Tiến hành chạy danh sách slug bị lỗi");
        await crawlOPhimKKPhimFromListSlug(listFilmError);
      } catch (error) {
        console.log(
          "Bị lỗi khi cố gắng get lại những slug phim bị lỗi. Tiến hành lại >> ",
          error
        );
        await crawlOPhimKKPhimFromListSlug(listFilmError);
      }
      // const filePath = join(__dirname, "list ophim error.json");
      // writeFileSync(filePath, JSON.stringify(listFilmError, null, 2));
      // console.log("Đã tạo file danh sách phim get bị lỗi");
      // listFilmError.splice(0, listFilmError.length); // Xóa hết dữ liệu trong mảng
    }
  } catch (error: any) {
    console.log("Lỗi khi thư hiện thao tác bulkWrite: ", error);
  }
}

export async function checkAndCrawlFromNguonC(
  startPage = 1,
  endPage = 50,
  all = false
) {
  console.log("|-------- CRAWL DỮ LIỆU PHIM TỪ NGUONC ---------|");
  try {
    //Khởi chạy từ trang start đến trang end, mặc định start là 1, end là 50
    // tức là crawl dữ liệu từ trang 1 tới trang 50 đối với ổ phim
    const response = await fetch(
      "https://phim.nguonc.com/api/films/phim-moi-cap-nhat",
      fetchOptions
    ).then((value) => value.json());
    console.log("Lấy xong thông tin tổng trang >> ");
    const totalPages = response.paginate.total_page;
    const start = +startPage ?? 1;
    const end = all ? +totalPages : +endPage > +totalPages ? 50 : endPage;

    console.log("Start page, end page >> ", start, end);

    //Tạo biến lưu trữ dữ liệu chi tiêt của từng phim

    const listFilmError = [];
    // vòng lặp chạy từ start đến end để get dữ liệu từng trang thông tin phim
    for (let i = start; i <= end; i++) {
      const dataList = [];
      // get dữ liệu từng trang thông tin phim
      const ress = await fetch(
        `https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=${i}`,
        fetchOptions
      );
      if (ress.ok) {
        const jsonData = await ress.json();
        if (jsonData && !isEmpty(jsonData.items)) {
          console.log("Lấy xong thông tin list phim >> ");
          const data = jsonData.items;
          // vòng lặp lấy dữ liệu chi tiết từng phim rồi lưu lại trong mảng
          for (const item of data) {
            try {
              console.log("Vòng lặp list film để get chi tiết phim ");
              const res = await fetch(
                `https://phim.nguonc.com/api/film/${item.slug}`,
                fetchOptions
              );
              if (res.ok) {
                const jsonData = await res.json();
                if (jsonData.movie) {
                  console.log("Đã get xong chi tiết phim >> ", item.name);
                  dataList.push(jsonData);
                }
              } else {
                if (res.status !== 404) {
                  listFilmError.push(item.slug);
                  console.log(
                    "Get chi tiết phim bị lỗi, đã thêm vào mảng listFilmError. Phim lỗi >> ",
                    item.name
                  );
                } else {
                  console.log(
                    "Get chi tiết phim bị lỗi do không tìm thấy thông tin phim. Mã lỗi: 404 - Not Found"
                  );
                }
              }
              // console.log("Đã thêm phim vào mảng dataList");
            } catch (error: any) {
              listFilmError.push(item.slug);
              console.log(
                "Get chi tiết phim bị lỗi nằm trong catch hàm chekAndCrawlFromNguonC >> với phim >> ",
                item.name,
                error.message
              );
            }
            await sleep(500);
          }
          console.log("Thêm hoàn tất thêm vào mảng tạm trang: ", i);

          await handleListPageFilmNguonC(dataList, i);
        }
      }
      await sleep(800);
    }

    if (listFilmError.length > 0) {
      console.log(
        "----------- Chạy lại danh sách slug get thông tin bị lỗi để xử lí -----------"
      );
      await crawlDataNguonCFromListSlug(listFilmError);
      // const filePath = join(__dirname, "listNguoncPhimError.json");
      // writeFileSync(filePath, JSON.stringify(listFilmError, null, 2));
      // console.log("Đã tạo file danh sách phim get bị lỗi");
      // listFilmError.splice(0, listFilmError.length); // Xóa hết dữ liệu trong mảng
    }
  } catch (error: any) {
    console.log("Lỗi khi thư hiện thao tác bulkWrite: ", error);
  }
}

export async function crawlDataNguonCFromListSlug(slugList: string[]) {
  console.log(
    "Bat dau cao du lieu tu danh sach slug >> so luong phan tu: ",
    slugList.length
  );
  try {
    const dataList = [];
    const listFilmError = [];
    for (const slug of slugList) {
      try {
        console.log("Vòng lặp list film để get chi tiết phim ");
        const res = await fetch(
          `https://phim.nguonc.com/api/film/${slug}`,
          fetchOptions
        );
        if (res.ok) {
          const jsonData = await res.json();
          if (jsonData.movie) {
            console.log("Đã get xong chi tiết phim >> ", slug);
            dataList.push(jsonData);
          }
        } else {
          listFilmError.push(slug);
          console.log("Get chi tiết phim bị lỗi với phim >> ", slug);
        }
        // console.log("Đã thêm phim vào mảng dataList");
      } catch (error: any) {
        listFilmError.push(slug);
        console.log(
          "Get chi tiết phim bị lỗi với phim >> ",
          slug,
          error.message,
          error?.stack
        );
      }
      await sleep(500);
    }
    console.log("Thêm hoàn tất thêm vào mảng tạm danh sách slug");

    try {
      console.log(
        "Tiến hành xử lí danh sách dữ liệu phim bị lỗi và đã get xong"
      );
      await handleListPageFilmNguonC(dataList, 1);
    } catch (error) {
      console.log(
        "Xử lí danh sách dữ liệu phim bị lỗi và đã get xong bị lỗi handleListPageFilm: ",
        error
      );
      console.log("Tiến hành xử lí lại handleListPageFilm");
      await handleListPageFilmNguonC(dataList, 1);
    }
    if (listFilmError.length > 0) {
      console.log(
        "List get phim bi loi: ",
        listFilmError.length,
        "Dang chay lai de xu li list error"
      );
      await crawlDataNguonCFromListSlug(listFilmError);
    }
  } catch (error) {
    console.log(
      "Loi khi xu li danh sach phim ham crawlDataNguonCFromListSlug: ",
      error,
      "Dang tien hanh goi lai ham xu li"
    );
    await crawlDataNguonCFromListSlug(slugList);
  }
}

export async function checkAndCrawlFromYuthanhthien() {
  console.log("|-------- CRAWL DỮ LIỆU PHIM TỪ YU THÁNH THIỆN ---------|");
  try {
    const res = await axios.get(
      "https://yuthanhthien.net/api/movie?offset=0&limit=1000"
    );
    const dataList = res.data.movies;
    console.log("Số lượng item: ", dataList.length);
    const dataOperations = [];
    const listFilm = [];
    for (const item of dataList) {
      const ress = await axios.get(
        `https://yuthanhthien.net/api/movie/${item.slug}`
      );
      const film = ress.data;
      if (film) {
        const { _id, ...rest } = film;

        listFilm.push(rest);
        // dataOperations.push(insertOneOperation);
        console.log("Đã thêm phim vào mảng tạm: ", film.title);
      }
    }

    console.log("Duyệt mảng tạm để chuyển đổi object thành phim lưu vào DB");

    for (const film of listFilm) {
      try {
        const exsitent = await FilmModel.findOne({
          title: { $regex: new RegExp(film.title.trim()), $options: "i" },
        });
        if (exsitent) {
          console.log(
            `Phim ${film.title} đã tồn tại. Tiến hành kiểm tra số tập phim`
          );
          if (
            film.episodes.length > exsitent.list_episode[0].list_link.length
          ) {
            const listEps = parseListEpisodeYuthanhthien(film.episodes);
            const totalEp =
              film.completed === true
                ? film.episodes.length === 1
                  ? "Tập FULL"
                  : film.episodes.length
                : "?";

            await exsitent.updateOne({
              list_episode: listEps,
              total_episode: totalEp,
            });
            console.log("Đã update số tập phim");
          }
        } else {
          const filmData = await returnFilmObjectForYuthanhthien(film);
          const operator = {
            updateOne: {
              filter: { title: film.title },
              update: {
                $set: filmData,
              },
              upsert: true,
            },
          };
          dataOperations.push(operator);
        }
      } catch (error: any) {
        console.log("Lỗi khi chuyển đổi dữ liệu phim >> ", film.title);
      }
    }

    if (dataOperations.length > 0) {
      await FilmModel.bulkWrite(dataOperations as any);
      console.log("Đã thêm tất cả các phim vào database");
    } else {
      console.log("Không có phim mới để thêm vào database");
    }
  } catch (error: any) {
    console.log("Error fetching data: ", error);
  }
}

export function saveJSONToFileFromClient(jsonData: any, fileName: string) {
  const jsonString = JSON.stringify(jsonData, null, 2); // Format JSON with indentation
  const blob = new Blob([jsonString], { type: "application/json" });
  const file = new File([blob], fileName, { type: "application/json" });
  const fileURL = URL.createObjectURL(file);
  const downloadLink = document.createElement("a");
  downloadLink.href = fileURL;
  downloadLink.download = fileName;
  downloadLink.click();
  URL.revokeObjectURL(fileURL); // Cleanup
}
