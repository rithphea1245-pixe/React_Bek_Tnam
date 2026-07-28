import { Outlet } from "react-router";
import NavbarComponent from "./components/nav-footer/NavbarComponent";
import FooterComponent from "./components/nav-footer/FooterComponent";

export default function Layout() {
  return (
    <div>
      <NavbarComponent/>
      <Outlet/>
      <FooterComponent/>
    </div>
  )
}
