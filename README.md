# Minim Icon

A minimal SVG icon collection with two delivery options: the original zero-config CSS masks and a React component library with a Lucide-style developer experience. The files in [`public/icons`](./public/icons) are the single source of truth for both.

🔗 **Live Demo**: [https://minim-icon.vercel.app/](https://minim-icon.vercel.app/)

## CSS quick start

Add this line to your HTML `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/poposnail61/minim-icon@main/public/icons.css" />
```

Then use icons anywhere:

```html
<i class="icon icon-globe"></i>
```

The CSS API remains fully supported. It is a good fit for static HTML and for apps that already use the CDN.

## React quick start

The React package is in this monorepo as `@minim-icon/react`. It is intentionally private until its npm scope ownership and license are confirmed; it is not published by this repository.

```bash
npm install @minim-icon/react react
```

Use named imports for the best tree-shaking result:

```tsx
import { ArrowRightOutline, LogoInstagramColor } from "@minim-icon/react";

export function ContinueButton() {
  return (
    <button type="button">
      Continue <ArrowRightOutline size={18} color="currentColor" aria-label="Continue" />
      <LogoInstagramColor size={18} title="Instagram" />
    </button>
  );
}
```

Every icon forwards its `ref`, accepts normal SVG attributes (`className`, `aria-*`, event handlers, etc.), and adds these convenience props:

| Prop | Default | Meaning |
| --- | --- | --- |
| `size` | `24` | SVG `width` and `height`; accepts a number or CSS length. |
| `color` | inherited | SVG `currentColor` value for monochrome icons. |
| `title` | none | Adds `<title>` and makes the icon an accessible image. Icons without a title are decorative (`aria-hidden`). |

The collection has 214 source icons. Monochrome `#18181B`/black artwork is generated as `currentColor`; `*-color` and gradient icons retain their original brand colors. Gradient ids are prefixed with React `useId`, so repeated server-rendered icons cannot collide.

### Dynamic and deep imports

`MinimIcon` renders an icon from its original kebab-case filename. `icons` and `iconNames` provide metadata and the valid names.

```tsx
import { MinimIcon, dynamicIconImports, type IconName } from "@minim-icon/react";

const name: IconName = "arrow-right-outline";

<MinimIcon name={name} size="1.25em" title="Next" />;

// For a code-split picker, load a component only when it is needed.
const module = await dynamicIconImports[name]();
const Icon = module.ArrowRightOutline;
```

Direct component imports are also exported for bundlers that prefer a narrow entry point:

```tsx
import { ArrowRightOutline } from "@minim-icon/react/icons/arrow-right-outline";
```

The source collection contains three historic filename typos. Their original exports (`Tiket*`, `MultyPerson*`, `UnfoldColse*`) remain available and are marked deprecated; prefer the aliases `Ticket*`, `MultiPerson*`, and `UnfoldClose*`.

### React library development

Generated files live in `packages/react/src/icons` and must not be hand-edited. Regenerate them after changing an SVG:

```bash
npm run react:generate  # rewrite generated components and registry
npm run react:check     # verify generated sync, types, and SSR behavior
npm run react:build     # generate ESM, CommonJS, and declaration outputs
```

The existing `npm run build` continues to build only the Next.js application and refresh its CSS. Run the explicit `react:*` commands when working on the library.

## ✨ Features

-   **Zero Config**: No build steps or npm packages required.
-   **GitHub Powered**: Upload SVGs to your repo, and they appear instantly.
-   **CSS Control**: Size and color are controlled via standard CSS (`font-size`, `color`).
-   **Optimized**: Icons are loaded as CSS masks, ensuring perfect scaling and color inheritance.
-   **React-ready**: Generated, typed React components with named exports, dynamic imports, and ESM/CJS builds.

## 🛠️ Deployment

This project is built with Next.js and is ready to be deployed on Vercel.

1.  Fork/Clone this repository.
2.  Deploy to Vercel.
3.  Set the following Environment Variables:
    -   `ADMIN_PASSWORD`: Password for the admin dashboard.
    -   `GITHUB_TOKEN`: Personal Access Token with `repo` scope.
    -   `GITHUB_OWNER`: Your GitHub username.
    -   `GITHUB_REPO`: This repository name.

## 📝 Admin Dashboard

Visit `/admin` to upload or delete icons.
Login with the password set in `ADMIN_PASSWORD`.
