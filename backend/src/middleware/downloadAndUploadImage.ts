import path from "path";
import axios from "axios";
import sharp from "sharp";
import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";
import { existsSync, mkdirSync, writeFileSync } from "fs";

import { PATH_STATIC_IMAGE } from "../common/config";

let errorArr: any[] = [];
let uploadSuccess = new Set();

export async function downloadAndUploadImageToCloudinary(
  url: string,
  folder: "thumbnail" | "poster"
): Promise<string & any> {
  try {
    console.warn("Dang vao ham download image >> ", folder);
    if (!uploadSuccess.has(url)) {
      // Tải ảnh về từ URL
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 3600,
      });

      // Nén ảnh bằng Sharp
      const resizedImageBuffer = await sharp(response.data)
        .webp({ quality: 50 })
        .toBuffer();

      // Upload ảnh lên Cloudinary
      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            format: "webp",
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        streamifier.createReadStream(resizedImageBuffer).pipe(stream);
      });
      // Lấy link ảnh từ Cloudinary
      const imageUrl = uploadResult.secure_url;
      uploadSuccess.add(url);
      console.log("Da upload thanh cong >>", imageUrl);
      // console.log("kkkww", imageUrl);

      return imageUrl;
    } else {
      console.log("Anh da ton tai");
      return null;
    }
  } catch (error: any) {
    console.error("Error:", error?.message + "--> " + url + " " + folder);
    errorArr.push({ url: url, type: folder });
    return "";
  }
}

export async function downloadAndProcessImage(
  imageUrl: string,
  folder?: string,
  qualityToImprove?: number,
  fileNameCustom?: string
) {
  // Đường dẫn đến thư mục 'public/thumbnail' hoặc folder

  const assetsDirectory = `${PATH_STATIC_IMAGE}/${folder ?? "thumbnail"}`;

  // Kiểm tra xem thư mục tồn tại hay không, nếu không, tạo mới
  if (!existsSync(assetsDirectory)) {
    mkdirSync(assetsDirectory, { recursive: true });
  }
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 3600,
    });
    const imageBuffer = Buffer.from(response.data);

    const processedImageBuffer = await sharp(imageBuffer)
      .webp({ quality: 50 })
      .toBuffer();

    // Lấy tên tập tin từ URL
    const fileName = fileNameCustom
      ? fileNameCustom
      : path.basename(imageUrl).split(".")[0];
    const imagePath = `${assetsDirectory}/${fileName}.webp`;

    writeFileSync(imagePath, processedImageBuffer);
    console.log(
      "path ảnh >> ",
      imagePath,
      "Được lưu lại trong db = ",
      `assets${imagePath.split("assets")[1]}`.replace(/\\/g, "/")
    );

    return `assets${imagePath.split("assets")[1]}`.replace(/\\/g, "/"); // Trả về đường dẫn của ảnh đã xử lý
  } catch (error: any) {
    console.error("Error downloading and processing image:", error.message);
    return imageUrl;
    throw error;
  }
}
