import { useState } from "react";
import UserTableComponent from "../../components/table/UserTableComponent";
import { MOCK_USERS } from "../../lib/mockUsers";

export default function UsersManagementPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [notice, setNotice] = useState("");

  const handleDelete = (user) => {
    setUsers((current) => current.filter((item) => item.uuid !== user.uuid));
    setNotice(`Removed ${user.name} from the list.`);
  };

  return (
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-1">Users Dashboard</h1>
      <p className="mb-4 text-sm text-gray-500">
        Manage dashboard users. Sorting, search, and pagination are handled by
        the reusable table component.
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

      <UserTableComponent data={users} onDelete={handleDelete} />
    </div>
  );
}
