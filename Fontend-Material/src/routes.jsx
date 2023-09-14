import {
  HomeIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon
} from "@heroicons/react/24/solid";

import { Dashboard, ProductList, MachineLists, OEEa, OEEb, Notifications } from "@/pages/home";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    title: "HOME",
    layout: "home",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        icon: <DocumentTextIcon {...icon} />,
        name: "รายการผลิต",
        path: "/processlist",
        element: <ProductList />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "รายการเครื่องจักร",
        path: "/MachineLists",
        element: <MachineLists />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "OEEa",
        path: "/OEEa",
        element: <OEEa />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "OEEb",
        path: "/OEEb",
        element: <OEEb />,
      },
      // {
      //   icon: <BellIcon {...icon} />,
      //   name: "notifactions",
      //   path: "/notifactions",
      //   element: <Notifications />,
      // },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ArrowRightOnRectangleIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <UserPlusIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
