import {
  BanknotesIcon,
  UserPlusIcon,
  UserIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

export const statisticsCardsData = [
  {
    color: "pink",
    icon: UserIcon,
    title: "ปริมาณสะสมวันนี้",
    value: "20,300",
    footer: {
      color1: "text-green-500",
      value: "13/09/2023, 01:55",
      color2: "text-gray-500",
      label: "",
    },
  },
  {
    color: "orange",
    icon: ChartBarIcon,
    title: "ปริมาณของดี",
    value: "8,145",
    footer: {
      color1: "text-green-500",
      value: "95%",
      color2: "text-gray-500",
      label: "ของยอดที่ผลิตได้",
    },
  },
  {
    color: "green",
    icon: UserPlusIcon,
    title: "ปริมาณของเสีย",
    value: "462",
    footer: {
      color1: "text-red-500",
      value: "5%",
      color2: "text-gray-500",
      label: "ของยอดที่ผลิตได้",
    },
  },
  {
    color: "blue",
    icon: BanknotesIcon,
    title: "ความเร็วเฉลี่ย",
    value: "21",
    footer: {
      color1: "text-green-500",
      value: "95%",
      color2: "text-gray-500",
      label: "ของความเร็วที่ตั้งไว้ 25",
    },
  },
];

export default statisticsCardsData;
