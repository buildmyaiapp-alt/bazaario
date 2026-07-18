export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full;
        const half = !filled && i === full && hasHalf;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            className={filled || half ? "text-amber-400" : "text-gray-300"}
          >
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              fill={half ? `url(#half-${i})` : "currentColor"}
              stroke={filled || half ? "none" : "currentColor"}
              strokeWidth={filled || half ? 0 : 1}
              d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.9l-5.2 2.62.99-5.8-4.21-4.1 5.82-.85z"
            />
          </svg>
        );
      })}
    </div>
  );
}
