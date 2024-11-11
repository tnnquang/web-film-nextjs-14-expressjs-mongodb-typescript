import mongoose from "mongoose";
import * as env from "../common/config";

mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);

async function connectDatabase() {
  try {
    await mongoose.connect(
      env.URI as string
      // "mongodb://cayphim:12345678@103.14.225.242:27017/cayphim?authSource=admin",
      // {
      //   user: "cayphim",
      //   pass: "12345678",
      // }
    );
    console.log("Đã kết nối đến database");
  } catch (error) {
    console.log("Lỗi, không kết nối được đến DB:", error);
  }
}

export default connectDatabase;
