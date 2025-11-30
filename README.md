# Minim Icon

A minimal, zero-config SVG icon manager for developers.
Host your own icons on GitHub and use them instantly in your projects via a single CSS link.

## 🚀 Quick Start

Add this line to your HTML `<head>`:

```html
<link rel="stylesheet" href="https://minim-icon.vercel.app/api/icons.css" />
```

Then use icons anywhere:

```html
<i class="icon icon-globe"></i>
```

## ✨ Features

-   **Zero Config**: No build steps or npm packages required.
-   **GitHub Powered**: Upload SVGs to your repo, and they appear instantly.
-   **CSS Control**: Size and color are controlled via standard CSS (`font-size`, `color`).
-   **Optimized**: Icons are loaded as CSS masks, ensuring perfect scaling and color inheritance.

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
