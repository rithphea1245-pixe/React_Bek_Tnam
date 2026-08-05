import { useState } from "react";
import { Link } from "react-router";
import "./App.css";
import ProductComponent from "./components/products/ProductComponent";
import LoadingComponent from "./components/LoadingComponent";
import { useGetProductsQuery } from "./features/products/productsApi";

const PAGE_SIZE = 12;

function App() {
  const [loadedPages, setLoadedPages] = useState(1);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetProductsQuery({ page: 0, size: PAGE_SIZE });

  const products = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const hasMore = products.length < totalElements;

  const loadMore = () => setLoadedPages((pages) => pages + 1);

  return (
    <div>
      {isLoading && <LoadingComponent />}

      {isError && (
        <div className="container mx-auto p-8 text-center">
          <p className="text-lg font-semibold text-red-600">
            Failed to load products.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {error?.status
              ? `Server returned ${error.status} (${error.data?.message || "unable to fetch"})`
              : error?.message || "Please check your internet connection."}
          </p>
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <p className="container mx-auto p-8 text-center text-gray-500">
          No products available yet.
        </p>
      )}

      <section className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4 gap-4">
        {products.map(({ uuid, name, priceOut, thumbnail, category }) => (
          <Link key={uuid} to={`/product/${uuid}`}>
            <ProductComponent
              title={name}
              price={priceOut}
              image={thumbnail}
              category={category?.name}
            />
          </Link>
        ))}
      </section>

      {loadedPages > 1 &&
        Array.from({ length: loadedPages - 1 }).map((_, index) => (
          <MoreProducts
            key={index}
            page={index + 1}
            size={PAGE_SIZE}
          />
        ))}

      {hasMore && (
        <div className="container mx-auto flex justify-center pb-8">
          <button
            type="button"
            onClick={loadMore}
            disabled={isFetching}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isFetching ? "Loading…" : "Load more products"}
          </button>
        </div>
      )}
    </div>
  );
}

function MoreProducts({ page, size }) {
  const { data, isFetching } = useGetProductsQuery({ page, size });
  const products = data?.content ?? [];

  if (isFetching && products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4 gap-4">
      {products.map(({ uuid, name, priceOut, thumbnail, category }) => (
        <Link key={uuid} to={`/product/${uuid}`}>
          <ProductComponent
            title={name}
            price={priceOut}
            image={thumbnail}
            category={category?.name}
          />
        </Link>
      ))}
    </section>
  );
}

export default App;
