'use client';
export const HeartIcon = ({
  fill = 'black',
  size = 24,
  height = 24,
  width = 24,
  ...props
}: {
  fill: string;
  size: number;
  height: number;
  width: number;
}) => {
  return (
    <svg
      fill={fill}
      height={size || height || 24}
      width={size || width || 24}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 21s-1-.45-1-1.55c0-.76.31-1.48.88-2.04C14.22 15.14 18 12.04 18 8.5c0-2.5-2-4.5-4.5-4.5-1.54 0-3.04.79-3.89 2.04C8.04 4.79 6.54 4 5 4 2.5 4 .5 6 .5 8.5c0 3.54 3.78 6.64 6.12 8.91.57.56.88 1.28.88 2.04C8 20.55 7 21 7 21"
        stroke={fill}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
