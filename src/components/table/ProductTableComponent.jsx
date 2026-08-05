import { useMemo } from "react";
import DataTableComponent from "./DataTableComponent";

function ProductTableComponent({
  data = [],
  onEdit,
  onDelete,
  isLoading,
  searchValue,
  onSearchChange,
}) {
  const columns = useMemo(
    () => [
      {
        id: "thumbnail",
        header: "Image",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {row.original.thumbnail ? (
              <img
                src={row.original.thumbnail}
                alt={row.original.name || "Product"}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  event.currentTarget.parentElement.textContent = "—";
                }}
              />
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
        ),
      },
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "category.name",
        header: "Category",
        cell: ({ getValue }) => getValue() ?? "—",
      },
      {
        accessorKey: "priceOut",
        header: "Price",
        cell: ({ getValue }) =>
          `$${Number(getValue() ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      },
      {
        accessorKey: "stockQuantity",
        header: "Stock",
        cell: ({ getValue }) => getValue() ?? "—",
      },
      {
        accessorKey: "availability",
        header: "Status",
        cell: ({ getValue }) =>
          getValue() ? (
            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
              Available
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
              Out of stock
            </span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(row.original)}
              className="px-3 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(row.original)}
              className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <DataTableComponent
      title="Products"
      columns={columns}
      data={data}
      rowKey="uuid"
      isLoading={isLoading}
      enableSearch
      searchPlaceholder="Search all products…"
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      enablePagination
      initialPageSize={5}
      emptyText="No products found. Click “Add Product” to create one."
    />
  );
}

export default ProductTableComponent;
