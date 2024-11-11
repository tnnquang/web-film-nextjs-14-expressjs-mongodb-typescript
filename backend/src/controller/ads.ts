import Ads from "../model/ads";

export async function createAds(req: any, res: any) {
  try {
    const { data } = req.body;
    await Ads.deleteMany({});
    const newData = new Ads({data});
    await newData.save();
    return res.status(200).json({ result: true });
  } catch (error: any) {
    return res.json({
      result: false,
      message: "Internal Server Error: " + error?.message ?? error,
      status: 500,
    });
  }
}

export async function getAllAds(req: any, res: any) {
  try {
    const ress = await Ads.findOne({}).lean();
    // console.log(ress, "response ads in database");
    return res.status(200).json({ result: ress, status: 200 });
  } catch (error) {
    return res.json({
      result: null,
      status: 500,
      message: "Internal Server Error",
      error,
    });
  }
}