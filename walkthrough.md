# SVG Icon Manager Walkthrough

I have built the SVG Icon Manager as requested. This system allows you to upload SVG icons, which are then processed to allow full control over color and size using standard CSS properties on `<i>` tags.

## Features

### 1. Icon Upload
- **Drag & Drop**: Easily upload SVG files.
- **Processing**: Icons are automatically processed to use `currentColor` for fills and strokes, ensuring they respond to CSS color changes.
- **Dynamic CSS**: The system generates a dynamic CSS file that defines classes for each icon.

### 2. Icon Gallery
- **List View**: See all uploaded icons.
- **Management**: Delete icons you no longer need.
- **Quick Copy**: Click to copy the class name (e.g., `.icon-my-icon`).

### 3. Usage
To use an icon in your code:

```html
<i class="icon icon-[filename]"></i>
```

**Example:**
If you upload `arrow.svg`:
```html
<i class="icon icon-arrow"></i>
```

### 4. Customization
You can control the size and color using standard CSS:

```css
.my-custom-icon {
  font-size: 24px; /* Controls size */
  color: red;      /* Controls color */
}
```

Or inline:
```html
<i class="icon icon-arrow" style="font-size: 48px; color: blue;"></i>
```

## Technical Details
- **Stack**: Next.js (App Router), Tailwind CSS.
- **Icon Implementation**: Uses **CSS Masks**. This allows the icon to take the background color of the element (which is set to `currentColor`), making it behave exactly like a font icon.
- **API**:
    - `GET /api/icons`: List icons.
    - `POST /api/icons`: Upload icon.
    - `DELETE /api/icons/[filename]`: Delete icon.
    - `GET /api/icons/css`: Generates the dynamic CSS.

## Verification
- Verified file upload via API.
- Verified dynamic CSS generation logic.
- Verified frontend components for listing and previewing icons.
