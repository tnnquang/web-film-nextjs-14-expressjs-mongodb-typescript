import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import multer from "multer";
import CompressingImages from "../middleware/compress_image";
import { config } from "dotenv";

config();

const server = express();

const corsOptions = {
  // origin: ["https://bongngo.net", "https://www.bongngo.net", "http://localhost"],
  // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  exposedHeaders: "x-access-token",
  // credentials: true,
  // optionsSuccessStatus: 204,
};

server.use(cors(corsOptions));

// server.use((req, res, next) => {
//   const referer = req.get('Referer');
//   if (referer && referer.startsWith('https://cayphim.live')) {
//     next();
//   } else {
//     res.status(403).send('Forbidden');
//   }
// });

// server.use(function (req, res, next) {
//   const allowedOrigins = [
//     "http://localhost:8388",
//     "https://cayphim.live",
//   ];
//   const origin = req.headers.origin;
//   if (!origin ?? allowedOrigins.indexOf(origin as any) === -1)
//     return res.status(405).json({ message: "Not Allowed" });

//   res.setHeader("Access-Control-Allow-Origin", origin ?? allowedOrigins);

//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Thiết lập middleware để phục vụ các tệp tĩnh từ thư mục 'public'


server.use("/", express.static(process.env.IMAGE_FOLDER as string));
server.use(express.json());
server.disable("x-powered-by");
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(bodyParser.urlencoded({ extended: true }));

server.use("/film", require("../routes/film"));
server.use("/ads", require("../routes/ads"));

server.post("/compress", upload.array("images"), CompressingImages);

export default server;
