// // no useEffect hook
// import React, { useEffect, useState } from 'react'

// export default function ProductCardComponent() {
//   const [products, setProducts] = useState([]);
//   // fetch data from api 
//   const fetchData = async() => {
//     const response = await fetch(`${import.meta.env.VITE_BASE_ISHOP_URL}/products`);
//     const data = await response.json(); 
//     setProducts(data.content);
//   }
//   // apply useEffect to handle fetching data from api 
//   useEffect(()=>{
//        fetchData();
//   },[]);// empty-array dependcies

//   return (
//     <div>
//     {
//       products.map(
//         (pro)=> {
//           return <h1>{pro.name}</h1>
//         }
//       )
//     }
      
//     </div>
//   )
// }


import React from 'react'

export default function ProductCardComponent() {
  return (
    <div>
      
    </div>
  )
}
