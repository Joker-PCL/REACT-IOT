import { Routes, Route } from "react-router-dom";
import {
  ChartPieIcon,
  DocumentTextIcon,
  ListBulletIcon
} from "@heroicons/react/24/solid";
import { Navbar } from "@/widgets/layout";
import routes from "@/routes";

export function NavMini() {
  const navbarRoutes = [
    {
      name: "Dashboard",
      path: "/home/dashboard",
      icon: ChartPieIcon,
    },
    {
      name: "รายการผลิต",
      path: "/home/processlist",
      icon: DocumentTextIcon,
    },
    {
      name: "รายการเครื่องจักร",
      path: "/home/MachineLists",
      icon: ListBulletIcon,
    },
  ];

  return (
    <>
      <div className="container relative z-40 mx-auto p-4">
        <Navbar routes={navbarRoutes} />
      </div>
      <Routes>
        {routes.map(
          ({ layout, pages }) =>
            layout === "auth" &&
            pages.map(({ path, element }) => (
              <Route exact path={path} element={element} />
            ))
        )}
      </Routes>
    </>
  );
}

NavMini.displayName = "/src/layout/NavMini.jsx";

export default NavMini;
