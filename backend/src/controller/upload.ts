import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import * as config from "../common/config";

cloudinary.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_KEY,
  api_secret: config.CLOUDINARY_SECRET,
  secure: true,
});

export async function UploadImageFilm(req: any, res: any, next: any) {
  try {
    const file = req.images[0];

    if (!file) {
      return res.status(422).json({
        message: "There are no files to upload",
        status: "Failed: Unprocessable Entity",
        code: 422,
      });
    }
    const ress = await cloudinary.uploader.upload(file.path, {
      allowed_formats: ["jpeg", "jpg", "png", "tiff", "webp", "avif"],
      folder: `film/`,
      resource_type: "auto",
      unique_filename: true,
      image_metadata: true,
      use_filename: true,
      overwrite: true,
    });
    fs.unlink(file.path, (error: any) => {
      if (error) {
        console.error("Error delete file: ", error);
        return;
      }
      console.log("Tệp tin đã được xoá");
    });
    req.urlImage = ress?.url;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error, status: 500 });
    next(error);
  }
}

export async function UploadMultipleImages(req: any, res: any, next: any) {
  try {
    const fileList = req.images ?? req.files;
    if (!fileList) {
      return res.status(422).json({
        message: "File list invalid",
        status: "Failed: Unprocessable Entity",
        code: 422,
        dataLink: [],
      });
    }

    const promises = [];
    const dataList = [];

    for (const file of fileList) {
      const promise = cloudinary.uploader.upload(file.path, {
        allowed_formats: ["jpeg", "png", "tiff", "webp", "avif", "gif"],
        folder: `blogger_post/${file.filename}/`,
        resource_type: "auto",
        unique_filename: true,
        image_metadata: true,
        use_filename: true,
        // filename_override: file.filename,
        overwrite: true,
      });

      promises.push(promise);
    }

    const results = await Promise.all(promises);

    for (const result of results) {
      dataList.push({ url: result.secure_url });
    }

    req.images = dataList;
    res.json({ dataLink: dataList });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
    return error;
  }
}

export async function saveImageFilm(req: any, res: any, next: any){
  try{
    const file= req.images[0]
    if (!file) {
      next()
      return res.status(422).json({
        message: "There are no files to upload",
        status: "Failed: Unprocessable Entity",
        code: 422,
      });
    }
  }
  catch(error: any){

  }
}

// export async function UploadVideo(req: any, res: any) {
//   try {
//     if (!req.file) {
//       return res.status(400).send({ message: "Không có file" });
//     }
//     const file = req.file;
//     console.log('video', fs.createReadStream(file, {encoding: "binary"}))
//     const config = {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         "api_key": "123774v9eris7ejjr68vkb",
//       },
//     };

//     const formData = new FormData();
//     formData.append("file", fs.createReadStream(file));
//     const response = await axios
//       .post(DOODSTREAM_API, CircularJSON.stringify(formData), config)
//       .then( export async (data) => await data.json()).then((value: any) => res.send({message: value}))

//       .catch((error) => res.send({ message: "Error: " + error }));

//     return res.status(200).send({
//       message: "Success",
//       data: response,
//     });
//   } catch (error) {
//     return res.status(500).send({
//       message: error,
//       status: 500,
//       file: req
//     });
//   }
// }
