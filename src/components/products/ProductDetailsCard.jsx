import { useState } from "react";
import {
  X,
  Pencil,
  Trash2,
  Plus,
  Cpu,
  MemoryStick,
  Monitor,
  BatteryFull,
  ShieldCheck,
  Save,
} from "lucide-react";

function currency(value) {
  return `$${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function SpecRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium text-right">{value}</span>
    </div>
  );
}

const emptyForm = {
  name: "",
  description: "",
  priceIn: "",
  priceOut: "",
  discount: "",
  stockQuantity: "",
  thumbnail: "",
  warranty: "",
  availability: true,
  categoryUuid: "",
  brandUuid: "",
  supplierUuid: "",
  computerSpec: {
    processor: "",
    ram: "",
    storage: "",
    gpu: "",
    os: "",
    screenSize: "",
    battery: "",
  },
};

function buildForm(product) {
  if (!product) return emptyForm;
  return {
    name: product.name ?? "",
    description: product.description ?? "",
    priceIn: product.priceIn ?? "",
    priceOut: product.priceOut ?? "",
    discount: product.discount ?? "",
    stockQuantity: product.stockQuantity ?? "",
    thumbnail: product.thumbnail ?? "",
    warranty: product.warranty ?? "",
    availability: product.availability ?? true,
    categoryUuid: product.category?.uuid ?? "",
    brandUuid: product.brand?.uuid ?? "",
    supplierUuid: product.supplier?.uuid ?? "",
    computerSpec: {
      processor: product.computerSpec?.processor ?? "",
      ram: product.computerSpec?.ram ?? "",
      storage: product.computerSpec?.storage ?? "",
      gpu: product.computerSpec?.gpu ?? "",
      os: product.computerSpec?.os ?? "",
      screenSize: product.computerSpec?.screenSize ?? "",
      battery: product.computerSpec?.battery ?? "",
    },
  };
}

export default function ProductDetailsCard({
  product,
  categories = [],
  brands = [],
  suppliers = [],
  initialMode = product ? "view" : "create",
  onSubmit,
  onDelete,
  onClose,
  isSubmitting,
  submitError,
  deleteError,
}) {
  const [mode, setMode] = useState(initialMode);
  const [currentProduct, setCurrentProduct] = useState(product);
  const [form, setForm] = useState(() => buildForm(product));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEditing = mode === "edit";
  const isCreating = mode === "create";

  const startCreate = () => {
    setCurrentProduct(null);
    setForm(emptyForm);
    setConfirmDelete(false);
    setMode("create");
  };

  const startEdit = () => {
    setForm(buildForm(currentProduct));
    setConfirmDelete(false);
    setMode("edit");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSpecChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      computerSpec: { ...prev.computerSpec, [name]: value },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      priceIn: Number(form.priceIn) || 0,
      priceOut: Number(form.priceOut) || 0,
      discount: Number(form.discount) || 0,
      stockQuantity: Number(form.stockQuantity) || 0,
      thumbnail: form.thumbnail,
      warranty: form.warranty,
      availability: form.availability,
      categoryUuid: form.categoryUuid,
      brandUuid: form.brandUuid,
      supplierUuid: form.supplierUuid,
    };
    if (isCreating) {
      const spec = {};
      for (const [key, value] of Object.entries(form.computerSpec)) {
        if (value) spec[key] = value;
      }
      payload.computerSpec = spec;
    }

    try {
      const updated = await onSubmit(payload, isEditing, currentProduct);
      if (isEditing) {
        setCurrentProduct(updated ?? currentProduct);
        setMode("view");
      } else {
        onClose();
      }
    } catch {
      // error is rendered via the submitError prop
    }
  };

  const confirmDeleteAction = async () => {
    try {
      await onDelete(currentProduct);
      onClose();
    } catch {
      // error is rendered via the deleteError prop
    }
  };

  const inputClass =
    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  const selectOptions = (items) => (
    <>
      <option value="">— Select —</option>
      {items.map((item) => (
        <option key={item.uuid} value={item.uuid}>
          {item.name}
        </option>
      ))}
    </>
  );

  const actionButton =
    "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isCreating
                ? "New Product"
                : isEditing
                  ? "Edit Product"
                  : "Product Details"}
            </h2>
            <p className="text-xs text-gray-500">
              {isCreating
                ? "Fill in the details to create a new product"
                : isEditing
                  ? "Update the fields below and save"
                  : "View all details and manage this product"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === "view" && currentProduct ? (
          <>
            {/* Image */}
            <div className="relative h-56 bg-gray-100">
              {currentProduct.thumbnail ? (
                <img
                  src={currentProduct.thumbnail}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <Cpu className="h-16 w-16" />
                </div>
              )}
              <span
                className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  currentProduct.availability
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {currentProduct.availability ? "Available" : "Out of stock"}
              </span>
              {Number(currentProduct.discount) > 0 && (
                <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-400 text-white">
                  -{currentProduct.discount}% OFF
                </span>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-blue-600 font-medium">
                  {currentProduct.category?.name || "Uncategorized"}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {currentProduct.name || "Untitled product"}
                </h3>
                {currentProduct.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {currentProduct.description}
                  </p>
                )}
              </div>

              {/* Pricing */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <p className="text-xs text-gray-500">Price out</p>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {currency(currentProduct.priceOut)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Price in</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {currency(currentProduct.priceIn)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Discount</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {Number(currentProduct.discount) > 0
                      ? `${currentProduct.discount}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Stock</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {currentProduct.stockQuantity ?? 0}
                  </p>
                </div>
              </div>

              {/* Specs */}
              {(currentProduct.computerSpec?.processor ||
                currentProduct.computerSpec?.ram ||
                currentProduct.computerSpec?.storage ||
                currentProduct.computerSpec?.gpu ||
                currentProduct.computerSpec?.os ||
                currentProduct.computerSpec?.screenSize ||
                currentProduct.computerSpec?.battery) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-gray-400" /> Computer
                    specifications
                  </h4>
                  <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-2">
                    <SpecRow
                      label="Processor"
                      value={currentProduct.computerSpec.processor}
                    />
                    <SpecRow
                      label="RAM"
                      value={currentProduct.computerSpec.ram}
                    />
                    <SpecRow
                      label="Storage"
                      value={currentProduct.computerSpec.storage}
                    />
                    <SpecRow
                      label="GPU"
                      value={currentProduct.computerSpec.gpu}
                    />
                    <SpecRow
                      label="OS"
                      value={currentProduct.computerSpec.os}
                    />
                    <SpecRow
                      label="Screen"
                      value={currentProduct.computerSpec.screenSize}
                    />
                    <SpecRow
                      label="Battery"
                      value={currentProduct.computerSpec.battery}
                    />
                  </div>
                </div>
              )}

              {/* Meta */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-gray-400" />
                  <dt className="text-gray-500">Brand</dt>
                  <dd className="text-gray-800 font-medium">
                    {currentProduct.brand?.name || "—"}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <BatteryFull className="h-4 w-4 text-gray-400" />
                  <dt className="text-gray-500">Supplier</dt>
                  <dd className="text-gray-800 font-medium">
                    {currentProduct.supplier?.name || "—"}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gray-400" />
                  <dt className="text-gray-500">Warranty</dt>
                  <dd className="text-gray-800 font-medium">
                    {currentProduct.warranty || "—"}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-gray-400" />
                  <dt className="text-gray-500">UUID</dt>
                  <dd className="text-gray-800 font-medium truncate">
                    {currentProduct.uuid}
                  </dd>
                </div>
              </dl>

              {/* Delete confirmation */}
              {confirmDelete ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <h4 className="font-semibold text-red-700">
                    Delete “{currentProduct.name}”?
                  </h4>
                  <p className="text-sm text-red-600 mt-1">
                    This action cannot be undone. Only products you created can
                    be deleted.
                  </p>
                  {deleteError && (
                    <p className="mt-2 text-sm text-red-700">{deleteError}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className={`${actionButton} border text-gray-700 hover:bg-gray-50`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteAction}
                      disabled={isSubmitting}
                      className={`${actionButton} bg-red-600 text-white hover:bg-red-700`}
                    >
                      <Trash2 className="h-4 w-4" />
                      {isSubmitting ? "Deleting…" : "Yes, delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={startCreate}
                    className={`${actionButton} border border-green-200 text-green-700 hover:bg-green-50`}
                  >
                    <Plus className="h-4 w-4" /> New
                  </button>
                  <button
                    type="button"
                    onClick={startEdit}
                    className={`${actionButton} bg-blue-600 text-white hover:bg-blue-700`}
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className={`${actionButton} bg-red-600 text-white hover:bg-red-700`}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Product name"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                placeholder="Short description"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="categoryUuid"
                  value={form.categoryUuid}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  {selectOptions(categories)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <select
                  name="brandUuid"
                  value={form.brandUuid}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  {selectOptions(brands)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier *
                </label>
                <select
                  name="supplierUuid"
                  value={form.supplierUuid}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  {selectOptions(suppliers)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price in *
                </label>
                <input
                  name="priceIn"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.priceIn}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price out *
                </label>
                <input
                  name="priceOut"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.priceOut}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={form.discount}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  name="stockQuantity"
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  name="thumbnail"
                  value={form.thumbnail}
                  onChange={handleChange}
                  placeholder="https://…"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty
                </label>
                <input
                  name="warranty"
                  value={form.warranty}
                  onChange={handleChange}
                  placeholder="e.g. 2 years"
                  className={inputClass}
                />
              </div>
            </div>

            <details className="border rounded-lg p-3">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                Computer specifications
              </summary>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Processor
                  </label>
                  <input
                    name="processor"
                    value={form.computerSpec.processor}
                    onChange={handleSpecChange}
                    placeholder="e.g. AMD Ryzen 9"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RAM
                  </label>
                  <input
                    name="ram"
                    value={form.computerSpec.ram}
                    onChange={handleSpecChange}
                    placeholder="e.g. 16GB DDR5"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Storage
                  </label>
                  <input
                    name="storage"
                    value={form.computerSpec.storage}
                    onChange={handleSpecChange}
                    placeholder="e.g. 1TB NVMe SSD"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPU
                  </label>
                  <input
                    name="gpu"
                    value={form.computerSpec.gpu}
                    onChange={handleSpecChange}
                    placeholder="e.g. RTX 4060"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OS
                  </label>
                  <input
                    name="os"
                    value={form.computerSpec.os}
                    onChange={handleSpecChange}
                    placeholder="e.g. Windows 11"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Screen size
                  </label>
                  <input
                    name="screenSize"
                    value={form.computerSpec.screenSize}
                    onChange={handleSpecChange}
                    placeholder="e.g. 14-inch OLED"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Battery
                  </label>
                  <input
                    name="battery"
                    value={form.computerSpec.battery}
                    onChange={handleSpecChange}
                    placeholder="e.g. 76Wh"
                    className={inputClass}
                  />
                </div>
              </div>
            </details>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                name="availability"
                type="checkbox"
                checked={form.availability}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Available for sale
            </label>

            {(submitError || deleteError) && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {submitError || deleteError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  if (isEditing) {
                    setMode("view");
                  } else {
                    onClose();
                  }
                }}
                className={`${actionButton} border text-gray-700 hover:bg-gray-50`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${actionButton} bg-blue-600 text-white hover:bg-blue-700`}
              >
                <Save className="h-4 w-4" />
                {isSubmitting
                  ? "Saving…"
                  : isEditing
                    ? "Save changes"
                    : "Create product"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
