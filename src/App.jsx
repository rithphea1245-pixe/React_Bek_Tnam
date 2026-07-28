import { useEffect, useState } from "react";
import "./App.css";
import CounterComponent from "./components/CounterComponent";
import ProductCardComponent from "./components/hooks/ProductCardComponent";
import FooterComponent from "./components/nav-footer/FooterComponent";
import NavbarComponent from "./components/nav-footer/NavbarComponent";
import { UserComponent } from "./components/UserComponent";
// import ProductComponent from './components/products/ProductComponent'
import { Suspense, lazy } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import LoadingComponent from "./components/LoadingComponent";
import { Link } from "react-router";

function App() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
   const loader = async() => {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_ISHOP_URL}/products`,
    );
    const result = await response.json();
    setProducts(result?.content);

   }
   loader()
    
  }, []);

  const ProductComponent = lazy(
    () => import("./components/products/ProductComponent"),
  );

  return (
    //  jsx rule will be presented here
    <div>

      <section className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4 gap-4">
        {/* renders product cards here */}

        {/* add loading */}
        <Suspense fallback={<LoadingComponent />}>
          {products.map(({ uuid, name, priceOut, thumbnail, category }) => (
            <Link  key={uuid} to={`/product/${uuid}`}>
              <ProductComponent
                title={name}
                price={priceOut}
                image={thumbnail}
                category={category?.name}
              />
            </Link>
          ))}
        </Suspense>
      </section>
    </div>
  );
}

export default App;
