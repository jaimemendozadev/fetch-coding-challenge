'use client';
export const ClearIcon = ({
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
      fill="none"
      height={size || height || 24}
      viewBox="0 0 24 24"
      width={size || width || 24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke={fill}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
