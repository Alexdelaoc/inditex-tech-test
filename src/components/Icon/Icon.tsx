import { icons } from './icons';

import type { IconName } from './icons';

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const { viewBox, width, height, content } = icons[name];

  return (
    <svg
      data-icon={name}
      viewBox={viewBox}
      width={width}
      height={height}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {content}
    </svg>
  );
}
