import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

function resolveRowKey(row, rowKey) {
  if (typeof rowKey === "function") return rowKey(row);
  return row?.[rowKey ?? "id"];
}

export default function DataTableComponent({
  columns,
  data = [],
  rowKey = "id",
  initialSorting = [],
  isLoading = false,
  isError = false,
  errorText = "",
  emptyText = "No data found.",
  title,
  footer,
  enableSearch = false,
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
  enablePagination = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
}) {
  const [internalSearch, setInternalSearch] = useState("");

  const isControlled = searchValue !== undefined;
  const globalFilter = isControlled ? "" : internalSearch;

  const table = useReactTable({
    data,
    columns,
    initialState: {
      sorting: initialSorting,
      pagination: {
        pageSize: enablePagination
          ? initialPageSize
          : Math.max(data.length, 1),
      },
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: isControlled ? undefined : setInternalSearch,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pagination = table.getState().pagination;
  const pageCount = Math.max(table.getPageCount(), 1);
  const totalRows = table.getFilteredRowModel().rows.length;

  const visibleRows = enablePagination
    ? table.getRowModel().rows
    : table.getCoreRowModel().rows;

  const emptyMessage = isControlled
    ? emptyText
    : globalFilter.trim()
      ? `No results match “${globalFilter.trim()}”.`
      : emptyText;

  return (
    <div className="p-4">
      {(title || enableSearch) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {enableSearch && (
            <input
              type="search"
              value={isControlled ? searchValue : internalSearch}
              onChange={(event) => {
                const value = event.target.value;
                if (isControlled) {
                  onSearchChange?.(value);
                } else {
                  setInternalSearch(value);
                }
              }}
              placeholder={searchPlaceholder}
              className="px-3 py-2 rounded-lg border text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      )}
      <div className="overflow-x-auto bg-white rounded-lg shadow border">
        <table className="min-w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50 border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  Loading…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-red-600"
                >
                  {errorText || "Failed to load data."}
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr
                  key={resolveRowKey(row.original, rowKey) ?? row.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && totalRows > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-gray-500">Rows per page</span>
            <select
              value={pagination.pageSize}
              onChange={(event) => {
                table.setPageSize(Number(event.target.value));
                table.setPageIndex(0);
              }}
              className="px-2 py-1 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">
              Page {pagination.pageIndex + 1} of {pageCount} · {totalRows} rows
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
