# Website UI

This folder contains the FoundYou website UI, built with React, TypeScript, and Vite. Icons come from `lucide-react`.

- `src/HomePage.tsx` — homepage component.
- `src/lostItemCategory.tsx` — lost item category page.
- `src/agentPage.tsx` — agent chat page.
- `src/main.tsx` — React entry point; renders the page based on the URL pathname.
- `src/globals.css` — homepage styling.
- `src/lostItemCategory.css` — lost item category page styling.
- `src/agentPage.css` — agent chat page styling. Its class names all start with `agent-` so they don't affect the other pages.

Pages and navigation:

| URL | Component | Purpose |
| --- | --- | --- |
| `/` | `HomePage` | Homepage with item description, image upload, and report buttons. |
| `/lost/category` | `LostItemCategory` | First step of the lost item flow, showing six item categories. |
| `/lost/agent` | `AgentPage` | Chat with the FoundYou agent to describe the lost item and see possible matches. |

Clicking **Report Lost Item** on the homepage navigates to `/lost/category`. You can also open that URL directly. Navigation currently uses `window.location.assign`, and `main.tsx` chooses the component without a routing library. Other paths currently render the homepage.

The category page displays Bookbag, Laptop & Technology, Water Bottle, Clothes & Apparel, ID, Wallet & Lanyards, and Keys & Accessories. Bookbag is currently selected by default. Category selection, Back to home, Go Back, and Continue are display-only placeholders. The homepage's About, Updates, Sign In, Upload Image, and Report Found Item buttons also have placeholder handlers.

The agent page opens on an empty chat. The left side shows the report so far: the category (currently fixed to Bookbag) and the color and location the agent collects, which show "Not yet known" for now. Typed messages appear in the chat, but nothing is sent to the agent yet; the spot to add the `/api/chat` call is marked in `handleSend`. Match cards use the same fields as the server's `get_item` result (`item_type`, `colors`, `area`, `found_at`) and are ready to show real items. Back, opening a match card, and See all possible matches instead are display-only placeholders. The category page's Continue button does not link to the agent page yet; open `/lost/agent` directly.

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
