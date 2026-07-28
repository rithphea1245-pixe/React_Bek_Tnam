

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

function ProductTableComponent() {
  const [data] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 28, city: 'New York' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 32, city: 'London' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 45, city: 'Paris' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', age: 29, city: 'Tokyo' }
  ]);

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'age',
      header: 'Age',
    },
    {
      accessorKey: 'city',
      header: 'City',
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div style={{ padding: '20px' }}>
      <h2>Employee Directory</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #ddd',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {{
                    asc: ' ↑',
                    desc: ' ↓',
                  }[header.column.getIsSorted()] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} style={{ padding: '12px' }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTableComponent;