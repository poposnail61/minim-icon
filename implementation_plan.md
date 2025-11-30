# SVG Icon Manager Implementation Plan

## Goal Description
Build a web application that allows users to upload SVG icons. The system will process these icons (converting colors to `currentColor`), store them, and provide a mechanism to use them in HTML via `<i>` tags with specific classes. The icons must respond to `font-size` for sizing and `color` for coloring.

## User Review Required
> [!NOTE]
> I will use the **CSS Mask** technique to implement the icon coloring and sizing. This is the most robust way to handle `currentColor` and `font-size` for external SVG files without requiring inline SVG injection or font generation.
>
> **CSS Strategy:**
> ```css
> .icon {
>   display: inline-block;
>   width: 1em;
>   height: 1em;
>   background-color: currentColor;
>   mask-size: contain;
>   mask-repeat: no-repeat;
>   mask-position: center;
> }
> .icon-[name] {
>   mask-image: url('/uploads/[name].svg');
> }
> ```

## Proposed Changes

### Project Setup
- Initialize a new Next.js application (App Router).
- Install `lucide-react` for UI icons (not the user uploaded ones).
- Install `clsx`, `tailwind-merge` for styling.

### Backend (API Routes)
#### [NEW] /app/api/icons/route.ts
- `GET`: List all uploaded icons.
- `POST`: Handle file upload.
    - Validate SVG mime type.
    - **Processing**: Read file content, regex/parse to replace `fill="..."` and `stroke="..."` with `currentColor` (or remove them to let CSS control it, but user asked for modification). *Refinement*: For CSS masks, the internal color doesn't matter, but I will still normalize it as requested.
    - Save file to `public/icons`.
    - (Optional) Regenerate a `public/icons.css` file or serve the CSS dynamically. For simplicity, I might create a dynamic CSS route or just list them in the frontend and apply styles inline for the demo, but for the "<i> tag usage" requirement, a generated CSS file is best.

#### [NEW] /app/api/icons/[filename]/route.ts
- `DELETE`: Remove the icon file.
- `PUT`: Update the icon content.

### Frontend
#### [NEW] /app/page.tsx
- Main dashboard.
- **Upload Section**: Drag and drop zone.
- **Gallery Section**: Grid of uploaded icons.
    - Each item shows the icon, name, and "Copy Class" button.
    - Edit/Delete controls.
- **Preview Section**: A playground to test `font-size` and `color` on the `<i>` tags.

#### [NEW] /app/globals.css
- Add the base `.icon` class definition.
- (Dynamically loaded) Styles for each icon.

## Verification Plan
### Automated Tests
- None planned for this prototype scope.

### Manual Verification
1. **Upload**: Upload an SVG with fixed colors (e.g., `fill="red"`).
2. **Check Processing**: Verify the saved file has `currentColor` or the system renders it correctly using masks.
3. **Usage**:
    - Add `<i class="icon icon-test"></i>` to the page.
    - Set `style="font-size: 48px; color: blue;"`.
    - Verify icon is 48px and blue.

## GitHub Distribution Plan
To make this system easy for developers to "take and use" (especially if they deploy to Vercel/Netlify), we need to solve the storage problem. Local filesystem storage doesn't work on serverless functions.

### Proposed Changes
#### [NEW] GitHub Storage Adapter
- Implement a storage interface: `upload(file)`, `delete(filename)`, `list()`.
- **GitHub Mode**: If `GITHUB_TOKEN` and `GITHUB_REPO` are present, use GitHub API to commit files directly to the `public/icons` directory of the repository.
    - This turns the repo into a CMS.
    - Uploading an icon -> Commits to `main` branch -> Triggers Vercel redeploy (optional) or just serves via raw.githubusercontent (or Next.js image optimization).
    - *Better approach for immediate usage*: The API reads from the "live" view (GitHub API) for the list, but for serving the CSS, it might need to fetch raw content if the deployment hasn't updated yet.
    - *Simplification*: For this version, we will implement the **Storage Abstraction** and provide the `GitHubStorage` implementation.

#### [NEW] Documentation
- `README.md`:
    - How to deploy.
    - How to set up GitHub Token.
    - How to use the icons.

