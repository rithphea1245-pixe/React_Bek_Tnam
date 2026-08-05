import { useParams } from "react-router";
import ProductDetailComponent from "../components/products/ProductDetailComponent";
import LoadingComponent from "../components/LoadingComponent";
import { useGetProductQuery } from "../features/products/productsApi";

export default function Product() {
  const { uuid } = useParams();

  const {
    data: product = {},
    isLoading,
    isError,
    error,
  } = useGetProductQuery(uuid);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (isError) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-lg font-semibold text-red-600">
          Failed to load product.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {error?.status
            ? `Server returned ${error.status}`
            : error?.message || "Product not found."}
        </p>
      </div>
    );
  }

  const { name, description, thumbnail, priceOut } = product;

  return (
    <ProductDetailComponent
      title={name}
      description={description}
      thumbnail={thumbnail}
      price={priceOut}
    />
  );
}
