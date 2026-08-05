import { useNavigate } from "react-router";
import { increment } from "../../features/counter/CounterSlice.js";
import { useAppDispatch, useAppSelector } from "../../lib/hook.js";

export default function ProductComponent({ image, title, category, price }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLogined = Boolean(useAppSelector((state) => state.auth?.token));

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isLogined) {
      const redirect = encodeURIComponent(window.location.pathname);
      navigate(`/auth/login?redirect=${redirect}`);
      return;
    }
    dispatch(increment());
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-80 border border-gray-200 rounded-xl shadow-md p-4 bg-white hover:shadow-lg transition-shadow">
        <div className="relative">
          <span className="absolute top-2 left-2 z-10 bg-orange-400 text-white text-xs font-semibold px-2 py-1 rounded-full">
            -20%
          </span>
          <button
            type="button"
            aria-label="Wishlist"
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
              />
            </svg>
          </button>
          <div className="overflow-hidden rounded-lg bg-gray-50">
            <img
              src={image}
              alt={title || "Product Image"}
              loading="lazy"
              className="object-contain w-full h-[220px] sm:h-[270px] hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-gray-800 font-medium text-base leading-snug">
            {title}
          </h3>
          <p className="uppercase text-green-600 text-xs font-medium mt-0.5">
            {category}
          </p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-blue-600 text-xl font-semibold">
                ${Number(price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-gray-400 text-sm line-through">$1500.00</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M17 17h-11v-14h-2" />
              <path d="M6 5l14 1l-1 7h-13" />
            </svg>
            {isLogined ? "Add to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
