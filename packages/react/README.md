# minim-icon-react

Typed, tree-shakable React components for the [Minim Icon](https://github.com/poposnail61/minim-icon) SVG collection.

```bash
npm install minim-icon-react react
```

```tsx
import { ArrowRightOutline, MinimIcon } from "minim-icon-react";

<ArrowRightOutline size={20} title="Continue" />;
<MinimIcon name="arrow-right-outline" color="rebeccapurple" />;
```

All components forward SVG refs and accept standard SVG props plus `size`, `color`, and `title`. Named imports are tree-shakable; direct imports are also supported:

```tsx
import { ArrowRightOutline } from "minim-icon-react/icons/arrow-right-outline";
```

The source SVGs live in `public/icons` in the repository. The package build regenerates ESM, CommonJS, and TypeScript declaration outputs before packing or publishing.

MIT © 2026 poposnail61
