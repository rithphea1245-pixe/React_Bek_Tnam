import { Outlet } from "react-router";
import SideBarDashboard from "../components/layout/SideBarDashboard";

const mobileNav = [
  { name: "Table Data", href: "/dashboard/table-data" },
  { name: "Products", href: "/dashboard/products" },
  { name: "Users", href: "/dashboard/users" },
];

export default function DasboardLayout() {
  return (
    <div>
      <nav className="md:hidden bg-gray-800 px-2 py-2 overflow-x-auto">
        <ul className="flex gap-2 text-sm text-gray-300 whitespace-nowrap">
          {mobileNav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-block px-3 py-1.5 rounded-md hover:bg-gray-700 hover:text-white"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <section className="grid grid-cols-1 md:grid-cols-[16rem_1fr]">
        <SideBarDashboard />
        <main className="min-w-0">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
