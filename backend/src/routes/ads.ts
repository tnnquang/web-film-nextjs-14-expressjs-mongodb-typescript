import express from "express";
import { createAds, getAllAds } from "../controller/ads";

const router = express.Router();


router.post("/create", createAds);
router.get("/get-all", getAllAds);


module.exports = router;
