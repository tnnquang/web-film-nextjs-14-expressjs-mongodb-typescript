import { FaHome } from "react-icons/fa";

export const listCategoryToShow = [
  {
    label: "Tình Cảm",
    slug: "tinh-cam",
  },
  {
    label: "Hành Động",
    slug: "hanh-dong",
  },
  {
    label: "Phiêu Lưu",
    slug: "phieu-luu",
  },
  {
    label: "Kiếm Hiệp",
    slug: "kiem-hiep",
  },
  {
    label: "Chính Kịch",
    slug: "chinh-kich",
  },
  {
    label: "Viễn Tưởng",
    slug: "vien-tuong",
  },
  {
    label: "Đam Mỹ",
    slug: "dam-my",
  },
  {
    label: "Khoa Học",
    slug: "khoa-hoc",
  },
  {
    label: "Chiến Tranh",
    slug: "chien-tranh",
  },
  {
    label: "Cổ Trang",
    slug: "co-trang",
  },
  {
    label: "Thần Thoại",
    slug: "than-thoai",
  },
  {
    label: "Võ Thuật",
    slug: "vo-thuat",
  },
  {
    label: "TV Shows",
    slug: "tv-shows",
  },
  {
    label: "Ma - Kinh Dị",
    slug: "kinh-di",
  },
  {
    label: "Hoạt Hình",
    slug: "hoat-hinh",
  },
];

export const listCountryToShow = [
  {
    label: "Việt Nam",
    slug: "viet-nam",
  },
  {
    label: "Trung Quốc",
    slug: "trung-quoc",
  },
  {
    label: "Hàn Quốc",
    slug: "han-quoc",
  },
  {
    label: "Âu Mỹ",
    slug: "au-my",
  },
  {
    label: "Anh",
    slug: "anh",
  },
  {
    label: "Thái Lan",
    slug: "thai-lan",
  },
  {
    label: "Pháp",
    slug: "phap",
  },
  {
    label: "Ấn Độ",
    slug: "an-do",
  },
  {
    label: "Nhật Bản",
    slug: "nhat-ban",
  },
];

export const menus = [
  {
    name: "Trang chủ",
    slug: "/",
    icon: <FaHome size={16} />,
    sub: false,
  },
  {
    name: "Phim lẻ",
    slug: "/danh-sach/phim-le",
    sub: false,
  },
  {
    name: "Phim bộ",
    slug: "/danh-sach/phim-bo",
    sub: false,
  },
  {
    name: "Quốc gia",
    slug: "#",
    sub: true,
    startWith: "/quoc-gia",
  },
  {
    name: "Thể loại",
    slug: "#",
    sub: true,
    startWith: "/the-loai",
  },
  {
    name: "Phim mới",
    slug: "/danh-sach/phim-moi-cap-nhat",
    sub: false,
  },
  // {
  //   name: "Chiếu rạp",
  //   slug: "/danh-sach/phim-chieu-rap",
  //   sub: false,
  // },
  // {
  //   name: "Loạt Phim",
  //   slug: "/loat-phim",
  //   sub: false,
  // },
  // {
  //   name: "TV Shows",
  //   slug: "/the-loai/tv-shows",
  //   sub: false,
  // },
];
