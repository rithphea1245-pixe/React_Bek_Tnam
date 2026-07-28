
export default function ProductDetailComponent({
  thumbnail, title, price, description
}) {
  return (
    <main className="max-w-6xl mx-auto p-6 lg:p-10">
  {/* Breadcrumb / Header */}
  <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
    <ol className="flex items-center gap-2">
      <li>
        <a href="/" className="hover:underline">
          Back to products
        </a>
      </li>
      <li>•</li>
      <li className="text-gray-700">{title}</li>
    </ol>
  </nav>
  <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    {/* LEFT: Images */}
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden bg-white p-6 shadow-sm">
        <div className="relative">
          <span className="absolute left-4 top-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white shadow">
            6% OFF
          </span>
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
        <div className="mt-4 flex gap-3 items-center">
          <div className="w-16 h-16 rounded-md border p-1 flex items-center justify-center bg-white">
            <img
              src={thumbnail}
              alt="thumb"
              className="w-full h-full object-cover rounded-sm"
            />
          </div>
          <div className="text-sm text-gray-500">
            High-resolution images • 4 views
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          About this product
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
    {/* RIGHT: Product Info */}
    <aside className="sticky top-6">
      <div className="bg-white rounded-xl shadow p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold leading-tight">
          {title}
        </h1>
        <div className="mt-4 flex items-end gap-4">
          <div>
            <div className="text-3xl lg:text-4xl font-extrabold price-shadow">
              ₹{price - price * 0.2}
            </div>
            <div className="text-sm text-gray-400 line-through">₹{price}</div>
            <div className="text-sm text-green-600 font-medium mt-1">
              You save ₹30
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Inclusive of all taxes
            </div>
          </div>
          <div className="ml-auto text-right">
            <button
              aria-label="Add to wishlist"
              className="p-2 rounded-md border hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-pink-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.656 3.172 11.83a4 4 0 010-5.656z" />
              </svg>
            </button>
          </div>
        </div>
        {/* Delivery & Stock */}
        <div className="mt-5 border rounded-lg p-4 bg-gray-50 flex items-center gap-4">
          <div className="flex-1 text-sm">
            <div className="font-medium">Delivery in 10-15 mins</div>
            <div className="text-xs text-gray-500">Shipment of 1 item</div>
          </div>
          <div className="text-sm font-medium text-green-600">In Stock</div>
        </div>
        {/* Quantity & Add */}
        <div className="mt-5">
          <label
            htmlFor="qty"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Quantity{" "}
            <span className="text-xs text-gray-400">(99 available)</span>
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border overflow-hidden">
              <button
                id="dec"
                className="px-4 py-2 text-lg bg-white hover:bg-gray-100"
              >
                −
              </button>
              <input
                id="qty"
                type="number"
                defaultValue={1}
                min={1}
                max={10}
                className="w-16 text-center outline-none p-2"
                aria-label="Quantity"
              />
              <button
                id="inc"
                className="px-4 py-2 text-lg bg-white hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <button
              id="addToCart"
              className="ml-auto flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-3 shadow"
            >
              🛒 Add to Cart
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Max order limit:{" "}
            <strong className="text-gray-700">10 per customer</strong>
          </p>
        </div>
        <hr className="my-6" />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
          <div>
            <dt className="text-xs text-gray-500">Origin</dt>
            <dd className="mt-1">India</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Storage</dt>
            <dd className="mt-1">Store in dry place</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Shipment</dt>
            <dd className="mt-1">1 item</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Tags</dt>
            <dd className="mt-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs bg-green-50 text-green-700">
                Fruit
              </span>
            </dd>
          </div>
        </dl>
      </div>
      {/* Collapsible Details Card */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
        <button
          aria-expanded="false"
          className="w-full flex items-center justify-between py-2 px-1"
          id="toggleDetails"
        >
          <span className="font-medium">Nutrition &amp; Details</span>
          <svg
            id="chev"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06-.02L10 10.88l3.71-3.69a.75.75 0 111.06 1.06l-4.24 4.22a.75.75 0 01-1.06 0L5.25 8.25a.75.75 0 01-.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div id="detailsPanel" className="mt-3 hidden text-sm text-gray-600">
          <ul className="list-disc pl-5 space-y-1">
            <li>Calories: 46 kcal per 100g</li>
            <li>Rich in vitamins A &amp; C</li>
            <li>Keep refrigerated for longer shelf life</li>
          </ul>
        </div>
      </div>
      {/* Mobile sticky CTA */}
      <div
        id="mobileCta"
        className="fixed left-0 right-0 bottom-4 px-4 lg:hidden"
      >
        <div className="max-w-3xl mx-auto">
          <button
            id="mobileAdd"
            className="w-full bg-green-600 text-white rounded-full py-3 font-semibold shadow-lg"
          >
            🛒 Add to Cart — ₹450
          </button>
        </div>
      </div>
    </aside>
  </section>
</main>
  )
}
