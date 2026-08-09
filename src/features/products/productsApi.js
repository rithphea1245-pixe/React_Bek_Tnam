import { createApi } from "@reduxjs/toolkit/query/react";
import { reauthBaseQuery } from "../auth/reauthBaseQuery";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: reauthBaseQuery,
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    // GET /products?page=&size=&name=
    getProducts: builder.query({
      query: ({ page = 0, size = 12, name = "" } = {}) => {
        const params = new URLSearchParams({ page, size });
        if (name) params.set("name", name);
        return `/products?${params.toString()}`;
      },
      transformResponse: (response) => ({
        content: response?.content ?? response ?? [],
        totalElements: response?.totalElements ?? 0,
        totalPages: response?.totalPages ?? 0,
        page: response?.number ?? 0,
      }),
      providesTags: (result) =>
        Array.isArray(result?.content)
          ? [
              ...result.content.map(({ uuid }) => ({ type: "Product", id: uuid })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),
    // GET /products/:uuid
    getProduct: builder.query({
      query: (uuid) => `/products/${uuid}`,
      providesTags: (_result, _error, uuid) => [{ type: "Product", id: uuid }],
    }),
    // POST /products
    createProduct: builder.mutation({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    // PUT /products/:uuid
    updateProduct: builder.mutation({
      query: ({ uuid, ...body }) => ({
        url: `/products/${uuid}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [
        { type: "Product", id: uuid },
        { type: "Product", id: "LIST" },
      ],
    }),
    // DELETE /products/:uuid
    deleteProduct: builder.mutation({
      query: (uuid) => ({
        url: `/products/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Product", id: uuid },
        { type: "Product", id: "LIST" },
      ],
    }),
    // GET /categories
    getCategories: builder.query({
      query: () => "/categories",
      transformResponse: (response) => response?.content ?? response ?? [],
    }),
    // GET /brands
    getBrands: builder.query({
      query: () => "/brands",
      transformResponse: (response) => response?.content ?? response ?? [],
    }),
    // GET /suppliers
    getSuppliers: builder.query({
      query: () => "/suppliers",
      transformResponse: (response) => response?.content ?? response ?? [],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetSuppliersQuery,
} = productsApi;
