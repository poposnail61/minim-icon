import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArrowRightOutline, LogoInstagramColor, MinimIcon, icons } from "../src/index.js";

describe("generated icon components", () => {
  it("renders named components with standard SVG props and an accessible title", () => {
    const markup = renderToStaticMarkup(
      <ArrowRightOutline size={32} color="rebeccapurple" title="Next" className="icon" data-test="arrow" />,
    );

    expect(markup).toContain('width="32"');
    expect(markup).toContain('height="32"');
    expect(markup).toContain('color="rebeccapurple"');
    expect(markup).toContain('role="img"');
    expect(markup).toContain("<title>Next</title>");
    expect(markup).toContain('fill="currentColor"');
  });

  it("supports the dynamic base component and exposes all source metadata", () => {
    expect(icons).toHaveLength(214);
    expect(renderToStaticMarkup(<MinimIcon name="arrow-right-outline" />)).toContain('aria-hidden="true"');
  });

  it("derives accessible SVG defaults without overriding explicit accessibility props", () => {
    const labeled = renderToStaticMarkup(<ArrowRightOutline aria-label="Next" />);
    const labelledBy = renderToStaticMarkup(<ArrowRightOutline aria-labelledby="next-label" />);
    const explicitlyHidden = renderToStaticMarkup(<ArrowRightOutline title="Next" aria-hidden />);
    const explicitRole = renderToStaticMarkup(<ArrowRightOutline title="Next" role="presentation" />);

    expect(labeled).toContain('role="img"');
    expect(labeled).not.toContain('aria-hidden="true"');
    expect(labelledBy).toContain('role="img"');
    expect(labelledBy).toContain('aria-labelledby="next-label"');
    expect(explicitlyHidden).toContain('aria-hidden="true"');
    expect(explicitlyHidden).not.toContain('role="img"');
    expect(explicitRole).toContain('role="presentation"');
    expect(explicitRole).not.toContain('aria-hidden="true"');
  });

  it("prefixes color-icon gradient ids for collision-free SSR", () => {
    const markup = renderToStaticMarkup(
      <>
        <LogoInstagramColor />
        <LogoInstagramColor />
      </>,
    );
    const ids = [...markup.matchAll(/id="([^"]*paint0_radial_6751_2444)"/g)].map((match) => match[1]);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});
