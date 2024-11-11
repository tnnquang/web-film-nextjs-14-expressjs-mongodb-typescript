import os from 'os';
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const acceptedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
  "image/gif",
  "image/avif",
];

export default async function CompressingImages(req: any, res: any, next: any) {
  try {
    const images = req.files ?? [req.file];

    if (!images || images.length === 0) {
      return res
        .status(400)
        .send(
          "Please select at least one image file. Allowed images type: jpeg, png, jpg, tff, webp, gif, avif"
        );
    }

    // const outputDirectory = "compressed";
    const outputDirectory = os.tmpdir();

    // Kiểm tra xem thư mục tồn tại và tạo nó nếu cần
    // if (!fs.existsSync(outputDirectory)) {
    //   fs.mkdirSync(outputDirectory, { recursive: true });
    // }
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }
    
    let count = 0; // Đếm số lượng ảnh đã xử lý thành công
    const result: any[] = [];

    for (const image of images) {
      if (!acceptedMimeTypes.includes(image.mimetype)) {
        return res.status(422).json({
          message:
            "Please select an image file, other files are not allowed. Allowed images type: jpeg, png, jpg, tff, webp, gif, avif",
          status: "Failed: Unprocessable Entity",
          code: 422,
        });
      }
      const originalFileName = image.originalname;
      const compressedFileName = `${originalFileName.replace(
        /\.[^/.]+$/,
        ""
      )}_compressed.webp`;

      const inputBuffer = image.buffer;
      const outputPath = path.join(outputDirectory, compressedFileName);

      // Sử dụng sharp để nén ảnh và lưu dưới dạng .webp
      sharp(inputBuffer)
        .webp({ quality: 60 })
        .toFile(outputPath, (err, info) => {
          if (err) {
            console.error(`Error for compress image: ${err?.message ?? err}`);
          } else {
            result.push({
              fieldname: "image", // Tên field của file upload (phải trùng với tên field trong form)
              originalname: originalFileName,
              encoding: image.encoding,
              mimetype: info.format,
              destination: image.destination,
              filename: compressedFileName,
              path: outputPath,
              size: info.size, // Kích thước của file sau khi nén
            });
            count++;

            // Kiểm tra xem đã xử lý xong tất cả các ảnh chưa
            if (count === images.length) {
              req.images = result;
              next();
            }
          }
        });
    }
  } catch (error: any) {
    res.status(500).json({
      message: `${error?.message ?? error}`,
      status: "Internal Server Error",
      code: 500,
      result: [],
    });
  }
}
