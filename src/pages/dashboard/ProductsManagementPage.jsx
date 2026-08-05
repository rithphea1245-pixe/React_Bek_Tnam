import { useState } from "react";
import ProductTableComponent from "../../components/table/ProductTableComponent";
import ProductDetailCard from "../../components/products/ProductDetailCard";
import ProductDetailsCard from "../../components/products/ProductDetailsCard";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetSuppliersQuery,
} from "../../features/products/productsApi";
import { useLoginMutation } from "../../features/auth/authApi";
import { clearCredentials, setCredentials } from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector, useDebounce } from "../../lib/hook.js";

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

function LoginGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(
        setCredentials({ token: result.accessToken, user: result.user }),
      );
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold mb-1">Product Management</h1>
        <p className="text-sm text-gray-500 mb-4">
          Log in to manage products (create, read, update, delete).
        </p>
        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            required
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProductsManagementPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth?.token);
  const user = useAppSelector((state) => state.auth?.user);

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [view, setView] = useState("cards");
  const [overlay, setOverlay] = useState(null);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetProductsQuery(
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

  if (!token) {
    return <LoginGate />;
  }

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

  const logout = () => {
    dispatch(clearCredentials());
    setPage(0);
    setOverlay(null);
  };

  return (
    <div className="p-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          {user && (
            <p className="text-sm text-gray-500">
              Logged in as {user.email || user.username}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
          >
            + Add Product
          </button>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-lg text-sm font-medium border text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      </div>

      <p className="mb-4 text-xs text-gray-500">
        Click any card to open its details card with full CRUD. You can update
        or delete only the products you created.
      </p>

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

      <div className="mb-4 inline-flex rounded-lg border border-gray-200 bg-white p-1 text-sm">
        <button
          type="button"
          onClick={() => setView("cards")}
          className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
            view === "cards"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Cards
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={`px-4 py-1.5 rounded-md font-medium transition-colors ${
            view === "table"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Table
        </button>
      </div>

      {view === "cards" ? (
        isLoading ? (
          <p className="text-center text-gray-500 py-10">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No products found. Click “+ Add Product” to create one.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductDetailCard
                key={product.uuid}
                product={product}
                onView={openView}
                onEdit={openEdit}
                onDelete={openView}
              />
            ))}
          </div>
        )
      ) : (
        <ProductTableComponent
          data={products}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={openView}
          searchValue={search}
          onSearchChange={handleSearchChange}
        />
      )}

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
