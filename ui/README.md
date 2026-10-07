# Website UI

This folder contains the FoundYou website UI, built with React, TypeScript, and Vite. Icons come from `lucide-react`.

- `src/HomePage.tsx` — homepage component.
- `src/lostItemCategory.tsx` — lost item category page.
- `src/main.tsx` — React entry point; renders the page based on the URL pathname.
- `src/globals.css` — homepage styling.
- `src/lostItemCategory.css` — lost item category page styling.

Pages and navigation:

| URL | Component | Purpose |
| --- | --- | --- |
| `/` | `HomePage` | Homepage with item description, image upload, and report buttons. |
| `/lost/category` | `LostItemCategory` | First step of the lost item flow, showing six item categories. |

Clicking **Report Lost Item** on the homepage navigates to `/lost/category`. You can also open that URL directly. Navigation currently uses `window.location.assign`, and `main.tsx` chooses the component without a routing library. Other paths currently render the homepage.

The category page displays Bookbag, Laptop & Technology, Water Bottle, Clothes & Apparel, ID, Wallet & Lanyards, and Keys & Accessories. Bookbag is currently selected by default. Category selection, Back to home, Go Back, and Continue are display-only placeholders. The homepage's About, Updates, Sign In, Upload Image, and Report Found Item buttons also have placeholder handlers.

Install Node.js with npm, then run these commands from the repository root:

```sh
cd ui
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5174).

Keep the development server running while editing the UI. Saved changes appear automatically in the browser. Press Control + C to stop the server. `npm install` installs all listed dependencies, including `lucide-react`.

Run `npm run build` to typecheck and create a production build.

Run `npm run preview` after building to preview the production build locally. When hosting the UI, configure the host to serve `index.html` for page routes such as `/lost/category` so direct visits and refreshes work.

The existing React application lives in `../app/`. This UI starter is not yet connected to that app or the backend.
