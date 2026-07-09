import type React from "react";

export interface AppIconProps extends React.SVGProps<SVGSVGElement> {
  /** 图标尺寸（宽高相同），默认 32 */
  size?: number | string;
}

export function AppIcon({
  size = 32,
  ...props
}: AppIconProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="WeArchive"
      {...props}
    >
      <title>WeArchive</title>
      <rect width="1024" height="1024" rx="228" fill="#F3F7F4" />
      <path
        d="M512 248C362.3 248 248 352.7 248 488.4C248 568.6 288.5 638.6 351.2 682.5L330.4 779.5C327.4 793.7 342.9 804.5 354.8 796.1L450.3 728.6C470.3 732.4 491 734.4 512 734.4C661.7 734.4 776 629.7 776 494C776 352.7 661.7 248 512 248Z"
        fill="#1F8D61"
      />
      <circle cx="420" cy="496" r="32" fill="#F3F7F4" />
      <circle cx="512" cy="496" r="32" fill="#F3F7F4" />
      <circle cx="604" cy="496" r="32" fill="#F3F7F4" />
    </svg>
  );
}
