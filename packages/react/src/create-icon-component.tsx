import * as React from "react";
import type { MinimIconComponent, MinimIconProps } from "./types.js";

export type IconContent = (idPrefix: string) => React.ReactNode;

/** Creates the consistent SVG shell used by all generated icon components. */
export function createIconComponent(
  displayName: string,
  viewBox: string,
  content: IconContent,
): MinimIconComponent {
  const Icon = React.forwardRef<SVGSVGElement, MinimIconProps>(function MinimGeneratedIcon(
    { size = 24, color, title, children, ...svgProps },
    ref,
  ) {
    // Prefix every SVG id with React's SSR-safe identifier so multiple gradients never collide.
    const idPrefix = React.useId().replace(/:/g, "");
    const hasAccessibleName = Boolean(title || svgProps["aria-label"] || svgProps["aria-labelledby"]);
    const hasExplicitAccessibility = svgProps.role !== undefined || svgProps["aria-hidden"] !== undefined;
    const accessibility = hasExplicitAccessibility ? {} : hasAccessibleName ? { role: "img" } : { "aria-hidden": true };

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        width={size}
        height={size}
        color={color}
        {...accessibility}
        {...svgProps}
      >
        {title ? <title>{title}</title> : null}
        {content(idPrefix)}
        {children}
      </svg>
    );
  });

  Icon.displayName = displayName;
  return Icon;
}
