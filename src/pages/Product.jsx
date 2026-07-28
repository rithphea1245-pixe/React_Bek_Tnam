import { useEffect, useState } from "react";
import { useParams } from "react-router";
import ProductDetailComponent from "../components/products/ProductDetailComponent";

export default function Product() {
  const [detailProduct, setDetailProduct] = useState({});

  const { uuid } = useParams();
  console.log(`==> uuid: ${uuid}`)

  useEffect( () => {
     const loader = async() => {
       const response = await fetch(
      `${import.meta.env.VITE_BASE_ISHOP_URL}/products/${uuid}`,
    );
    console.log(`==> REsponse: ${response}`)
    const singleProduct = await response.json();
    setDetailProduct(singleProduct);
     }
     loader()
  },[uuid]);

  const { name, description, thumbnail, priceOut } = detailProduct;
  return (
    <ProductDetailComponent
      title={name}
      description={description}
      thumbnail={thumbnail}
      price={priceOut}
    />
  );
}
