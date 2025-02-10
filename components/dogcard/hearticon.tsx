'use client';
export const HeartIcon = ({
  fill = 'none',
  stroke = 'black',
  size = 24,
  height = 24,
  width = 24,
  ...props
}: {
  fill?: string;
  stroke?: string;
  size?: number;
  height?: number;
  width?: number;
}) => {
  return (
    <svg
      height={size || height || 24}
      width={size || width || 24}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 21s-6.5-4.3-9-8.3C1 9.2 2.5 5 6 3.8c2.2-.7 4.7 0 6 2 1.3-2 3.8-2.7 6-2 3.5 1.2 5 5.4 3 8.9-2.5 4-9 8.3-9 8.3Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
