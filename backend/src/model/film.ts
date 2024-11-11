import mongoose from "mongoose";

const episode = new mongoose.Schema(
  {
    title: String,
    link: String,
    slug: String
  },
  { timestamps: true }
);

const server = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Server #1",
  },
  list_link: [episode],
});

const replySchema = new mongoose.Schema(
  {
    rep_content: {
      type: String,
      required: true,
    },
    rep_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Thêm timestamps cho câu trả lời
);

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    replies: [replySchema], // Sử dụng schema của câu trả lời
  },
  { timestamps: true }
);

const itemRate = new mongoose.Schema(
  {
    star_number: Number,
  },
  { timestamps: true }
);

const filmSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    secondary_title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    trailer_url: {
      type: String,
      required: false,
      default: "",
    },
    thumbnail: {
      type: String,
      required: false,
      default: "",
    },
    poster: {
      type: String,
      required: false,
      default: "",
    },
    category: {
      type: [],
      required: true,
      default: [],
    },
    year_release: {
      type: String,
      required: false,
    },
    duration: {
      type: String,
      required: false,
    },
    total_episode: {
      type: String,
      required: true,
    },
    list_episode: {
      type: [server],
      required: true,
    },
    language: {
      type: [String],
      required: false,
    },
    country: {
      type: [String],
      required: false,
      default: [],
    },
    quality: {
      type: String,
      required: true,
      default: "",
    },
    comments: {
      type: [commentSchema],
      required: false,
      default: [],
    },
    director: {
      type: [String],
      required: false,
      default: [],
    },
    performer: {
      type: [String],
      required: false,
      default: [],
    },
    outstanding: {
      type: String,
      required: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    rate: {
      type: [itemRate],
      required: false,
    },
    views: {
      type: Number,
      required: false,
      default: 4672,
    },
    notify: {
      type: String,
      required: false,
    },
    source: {
      type: String,
      required: false,
    },
    origin_api_slug: {
      type: String,
      required: false,
    },
    keywords: {
      type: [String],
      required: true,
      default: []
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

filmSchema.index({updatedAt: -1})

export default mongoose.model("film", filmSchema);
