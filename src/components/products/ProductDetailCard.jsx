import {
  Pencil,
  Trash2,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  ShieldCheck,
  ExternalLink,
  Layers,
} from "lucide-react";

function currency(value) {
  return `$${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function SpecChip({ icon: Icon, label }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700">
      <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
      <span className="truncate max-w-[7rem]">{label}</span>
    </span>
  );
}

export default function ProductDetailCard({ product, onView, onEdit, onDelete }) {
  const {
    name,
    description,
    priceOut,
    priceIn,
    discount,
    stockQuantity,
    availability,
    thumbnail,
    warranty,
    category,
    brand,
    computerSpec,
  } = product;

  const discounted =
    Number(discount) > 0
      ? Number(priceOut) - Number(priceOut) * (Number(discount) / 100)
      : null;

  const lowStock =
    availability && Number(stockQuantity) > 0 && Number(stockQuantity) <= 5;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onView?.(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onView?.(product);
        }
      }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <Cpu className="h-12 w-12" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 shadow-sm backdrop-blur">
            {category?.name || "Uncategorized"}
          </span>
          {!availability && (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              Out of stock
            </span>
          )}
        </div>
        {Number(discount) > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}
        {lowStock && (
          <span className="absolute bottom-3 right-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            Only {stockQuantity} left
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-semibold leading-snug text-gray-900 line-clamp-1">
            {name || "Untitled product"}
          </h3>
          {description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">
            {currency(discounted ?? priceOut)}
          </span>
          {discounted !== null && (
            <span className="text-xs text-gray-400 line-through">
              {currency(priceOut)}
            </span>
          )}
          {Number(priceIn) > 0 && (
            <span className="ml-auto rounded-md bg-green-50 px-1.5 py-0.5 text-[11px] font-medium text-green-700">
              Cost {currency(priceIn)}
            </span>
          )}
        </div>

        {/* Spec chips */}
        {(computerSpec?.processor ||
          computerSpec?.ram ||
          computerSpec?.storage ||
          computerSpec?.gpu) && (
          <div className="flex flex-wrap gap-1.5">
            <SpecChip icon={Cpu} label={computerSpec.processor} />
            <SpecChip icon={MemoryStick} label={computerSpec.ram} />
            <SpecChip icon={HardDrive} label={computerSpec.storage} />
            <SpecChip icon={Monitor} label={computerSpec.gpu} />
          </div>
        )}

        {/* Meta */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{brand?.name || "—"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{warranty || "No warranty"}</span>
          </span>
          {availability ? (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {stockQuantity ?? 0} in stock
            </span>
          ) : (
            <span className="font-medium text-red-500">Unavailable</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onView?.(product);
          }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <ExternalLink className="h-4 w-4" /> Details
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.(product);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <Pencil className="h-4 w-4" /> Edit
        </button>
        <button
          type="button"
          aria-label="Delete product"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.(product);
          }}
          className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
