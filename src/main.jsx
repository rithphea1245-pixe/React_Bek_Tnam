import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import About from "./pages/About.jsx";
import Product from "./pages/Product.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";
import DasboardLayout from "./layout/DasboardLayout.jsx";
import Layout from "./Layout.jsx";
import AuthLayout from "./layout/AuthLayout.jsx";
import LoginComponent from "./components/auth/LoginComponent.jsx";
import RegisterComponent from "./components/auth/RegisterComponent.jsx";
import VerifyEmailComponent from "./components/auth/VerifyEmailComponent.jsx";
import { makeStore } from "./lib/store.js";
import SessionInitializer from "./lib/SessionInitializer.jsx";
import ProductsManagementPage from "./pages/dashboard/ProductsManagementPage.jsx";
import TableDataPage from "./pages/dashboard/TableDataPage.jsx";
import UsersManagementPage from "./pages/dashboard/UsersManagementPage.jsx";

const router = createBrowserRouter([
  // dashboardlayout
  {
    path: "/dashboard",
    element: <DasboardLayout />,
    children: [
      {
        path: "/dashboard/table-data",
        element: <TableDataPage />,
      },
      {
        path: "/dashboard/products",
        element: <ProductsManagementPage />,
      },
      {
        path: "/dashboard/users",
        element: <UsersManagementPage />,
      },
    ],
  },
  // main layout
  {
    path: "/",
    element: <Layout />,
    children: [
      {
         path: "/",
         element: <App/>,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/product/:uuid", //dynamic segment of product (uuid)
        element: <Product />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
    ],
  },
  // auth layout (register, login)
  {
    path: '/auth',
    element: <AuthLayout/>,
    children: [
      {
        path: '/auth/login',
        element: <LoginComponent/>
      },
      {
        path: '/auth/register',
        element: <RegisterComponent/>
      },
      {
        path: '/auth/verify-email',
        element: <VerifyEmailComponent/>
      }
    ]
  },
  {
    // custom not found page
    path: "*",
    element: <NotFound />,
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <StrictMode>
    <Provider store={makeStore()}>
      <SessionInitializer>
        <RouterProvider router={router} />
      </SessionInitializer>
    </Provider>
  </StrictMode>,
);
