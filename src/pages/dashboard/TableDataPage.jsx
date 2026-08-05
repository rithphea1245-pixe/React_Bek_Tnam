import { useState } from "react";
import ProductTableComponent from "../../components/table/ProductTableComponent";
import UserTableComponent from "../../components/table/UserTableComponent";
import ProductDetailsCard from "../../components/products/ProductDetailsCard";
import { useAppSelector, useDebounce } from "../../lib/hook.js";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetSuppliersQuery,
} from "../../features/products/productsApi";

const PAGE_SIZE = 10;

function errorMessage(error) {
  if (!error) return "";
  if (error.status === 401) {
    return "Your session expired. Please log in again.";
  }
  if (error.status === 403) {
    return "You are not authorized to modify this product. You can only update or delete products that you created.";
  }
  if (error.status === 404) {
    return "Product not found. It may belong to another account or may already have been deleted.";
  }
  return (
    error.data?.description ||
    error.data?.message ||
    error.message ||
    "Something went wrong."
  );
}

export default function TableDataPage() {
  const token = useAppSelector((state) => state.auth?.token);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [overlay, setOverlay] = useState(null);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  const { data, isLoading, isError, error } = useGetProductsQuery(
    { page, size: PAGE_SIZE, name: debouncedSearch },
    { skip: !token },
  );

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  const {
    data: categories = [],
  } = useGetCategoriesQuery(undefined, { skip: !token });
  const {
    data: brands = [],
  } = useGetBrandsQuery(undefined, { skip: !token });
  const {
    data: suppliers = [],
  } = useGetSuppliersQuery(undefined, { skip: !token });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const isMutating = isCreating || isUpdating || isDeleting;

  const products = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const openOverlay = (product, mode) => {
    setFormError("");
    setDeleteError("");
    setOverlay({ product, mode });
  };

  const openCreate = () => openOverlay(null, "create");
  const openEdit = (product) => openOverlay(product, "edit");
  const openView = (product) => openOverlay(product, "view");

  const handleSubmit = async (payload, isEditing, currentProduct) => {
    setFormError("");
    try {
      if (isEditing) {
        const updated = await updateProduct({
          uuid: currentProduct.uuid,
          ...payload,
        }).unwrap();
        setNotice("Product updated successfully.");
        return updated;
      }
      await createProduct(payload).unwrap();
      setNotice("Product created successfully.");
      return null;
    } catch (err) {
      setFormError(errorMessage(err));
      throw err;
    }
  };

  const handleDelete = async (product) => {
    setDeleteError("");
    try {
      await deleteProduct(product.uuid).unwrap();
      setNotice(`Deleted “${product.name}”.`);
    } catch (err) {
      setDeleteError(errorMessage(err));
      throw err;
    }
  };

  return (
    <div className="p-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Table Data</h1>
          <p className="text-sm text-gray-500">
            Reusable dashboard table components with full CRUD against your API.
            Sort, search, and paginate any column.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
        >
          + Add Product
        </button>
      </div>

      {notice && (
        <p className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          {notice}
          <button
            type="button"
            onClick={() => setNotice("")}
            className="ml-3 text-green-900 underline text-xs"
          >
            Dismiss
          </button>
        </p>
      )}

      {isError && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          Failed to load products: {errorMessage(error)}
        </p>
      )}

      <section className="bg-white rounded-xl shadow border mb-6">
        <ProductTableComponent
          data={products}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={openView}
          searchValue={search}
          onSearchChange={handleSearchChange}
        />
      </section>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium border text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-lg text-sm font-medium border text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      <section className="bg-white rounded-xl shadow border">
        <div className="border-b px-4 py-3 bg-gray-50 rounded-t-xl">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Users — demo data
          </h2>
        </div>
        <UserTableComponent
          onView={(user) => setNotice(`View clicked for ${user.name}.`)}
          onDelete={(user) => setNotice(`Delete clicked for ${user.name}.`)}
        />
      </section>

      {overlay && (
        <ProductDetailsCard
          key={`${overlay.mode}-${overlay.product?.uuid || "new"}`}
          product={overlay.product}
          initialMode={overlay.mode}
          categories={categories}
          brands={brands}
          suppliers={suppliers}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onClose={() => setOverlay(null)}
          isSubmitting={isMutating}
          submitError={formError}
          deleteError={deleteError}
        />
      )}
    </div>
  );
}
