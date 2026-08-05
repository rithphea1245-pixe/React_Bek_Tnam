import { useMemo } from "react";
import DataTableComponent from "./DataTableComponent";
import { MOCK_USERS } from "../../lib/mockUsers";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  inactive: "bg-gray-200 text-gray-600",
};

const ROLE_STYLES = {
  Admin: "bg-purple-100 text-purple-700",
  Manager: "bg-blue-100 text-blue-700",
  Supplier: "bg-cyan-100 text-cyan-700",
  User: "bg-gray-100 text-gray-600",
};

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function UserTableComponent({ data = MOCK_USERS, onView, onDelete }) {
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-white">
              {initials(row.original.name)}
            </span>
            <span className="font-medium text-gray-900">{row.original.name}</span>
          </div>
        ),
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) => (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              ROLE_STYLES[getValue()] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
              STATUS_STYLES[getValue()] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "joinedAt",
        header: "Joined",
        cell: ({ getValue }) => getValue() ?? "—",
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onView?.(row.original)}
              className="px-3 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              View
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
    [onView, onDelete],
  );

  return (
    <DataTableComponent
      title="Users"
      columns={columns}
      data={data}
      rowKey="uuid"
      enableSearch
      searchPlaceholder="Search users…"
      enablePagination
      initialPageSize={5}
      emptyText="No users found."
    />
  );
}

export default UserTableComponent;
