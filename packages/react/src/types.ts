import type * as React from "react";

/** Props shared by every generated Minim icon component. */
export type MinimIconProps = Omit<React.SVGProps<SVGSVGElement>, "color" | "title"> & {
  /** CSS width and height. Defaults to 24. */
  size?: string | number;
  /** SVG currentColor value for monochrome icons. */
  color?: string;
  /** Adds an accessible SVG title and changes the default from decorative to an image. */
  title?: string;
};

export type MinimIconComponent = React.ForwardRefExoticComponent<
  MinimIconProps & React.RefAttributes<SVGSVGElement>
>;

export type IconMetadata = {
  name: string;
  componentName: string;
  viewBox: string;
  isColor: boolean;
};
