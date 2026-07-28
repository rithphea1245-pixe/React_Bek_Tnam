import { Outlet } from "react-router";
import NavbarComponent from "../components/nav-footer/NavbarComponent";
import FooterComponent from "../components/nav-footer/FooterComponent";
import SideBarDashboard from "../components/layout/SideBarDashboard";

export default function DasboardLayout() {
  return (
    <div>
      {/* <NavbarComponent/> */}
        <section className="grid grid-cols-2 gap-8">
          <SideBarDashboard/>
           <Outlet/> 
        </section>
      {/* <FooterComponent/> */}
    </div>
  )
}
