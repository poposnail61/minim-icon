import * as React from "react";
import { iconComponents, type IconName } from "./icons.js";
import type { MinimIconProps } from "./types.js";

export type MinimIconBaseProps = MinimIconProps & { name: IconName };

/** Render an icon by its kebab-case source name when a named import is not practical. */
export const MinimIcon = React.forwardRef<SVGSVGElement, MinimIconBaseProps>(function MinimIcon(
  { name, ...props },
  ref,
) {
  const Icon = iconComponents[name];
  return <Icon ref={ref} {...props} />;
});

MinimIcon.displayName = "MinimIcon";
