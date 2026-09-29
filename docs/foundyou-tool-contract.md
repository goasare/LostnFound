# FoundYou Assistant: Tool and Schema Contract

**Owner:** G
**For:** the image-recognition and backend teammate
**Source:** `docs/foundyou-plan-decisions.md`, Sections 3-5. The draft lists (Section 4 below) and Sections 5-7 come from ticket FOU-35, not the plan.

This doc defines the contract between the lost-item assistant and the backend. The mocks on G's side will match it exactly, so switching to the real backend is a one-line change.

Scope: the assistant serves the person who lost an item. The Found flow is out of scope, except where it shares the lists below.

---

## 1. `search_items`

### Input

```json
{
  "item_type": "earbuds",
  "colors": ["white"],
  "brand": "Apple",
  "keywords": "star sticker",
  "area": "Woodruff Library",
  "lost_after": "2026-09-26T00:00:00Z",
  "lost_before": "2026-09-28T00:00:00Z"
}
```

| Field | Required | Notes |
|---|---|---|
| `item_type` | yes | From a fixed list. |
| `colors` | no | Used for ranking, not filtering. |
| `brand` | no | Used for ranking, not filtering. |
| `keywords` | no | Free text. |
| `area` | no | From the campus locations list. Optional for now. |
| `lost_after` | no | Time window start. Optional for now. |
| `lost_before` | no | Time window end. Optional for now. |

The assistant turns the user's "where/when" into `area` plus a time window. Search matches items found in that area after the loss time.

### Output

- Up to **5** summaries. Each has: `id`, type, color, area, date.
- No image and no full details.
- Only items with `status` = `available` are returned, so resolved items drop out of search.

---

## 2. `get_item`

- **Input:** `id`.
- **Output:** the full **public** record, including `image_url`.
- Only `get_item` returns `image_url`.

---

## 3. Item record

```json
{
  "public": {
    "id": "item_0042",
    "category": "electronics",
    "item_type": "earbuds",
    "colors": ["white"],
    "brand": "Apple",
    "description": "White earbuds case",
    "area": "Woodruff Library",
    "location_detail": "2nd floor",
    "found_at": "2026-09-27T14:30:00Z",
    "image_url": "https://.../item_0042.jpg"
  },
  "server_only": {
    "finder_id": "user_817",
    "detected_text": "J. SMITH",
    "status": "available"
  }
}
```


**`server_only`** fields never reach the model or the browser:

- `finder_id`: routes messages to the finder.
- `detected_text`: sensitive text read off the item. Kept in the data for now but unused. It shows the public/server-only split, and tests can confirm it never appears in a tool result. Can be removed later if it causes issues or the image model can't produce it.
- `status`: `available` or `resolved`. The assistant never sees it.

**Photo-only rule:** only include fields a real photo can produce.

**Location and time:**

- The finder enters `area` from the campus list, plus an optional `location_detail`. `area` matches the `area` field in `search_items`.
- `found_at` defaults to the upload time and is editable.
- Photo metadata is not used (unreliable, and a privacy risk).
- Request to whoever builds the Found flow: use the same location list, and default the time to upload time.

---

## 4. Fixed lists

These lists are shared between the assistant and image recognition. `category` and `item_type` each include an `other` value so unusual items can still be searched. Each `item_type` belongs to one `category`. Mapping to be agreed with teammate.

Draft values are limited to things a photo can show.

### `category`

DRAFT: not agreed with teammate.

- electronics
- clothing
- bags
- accessories
- cards_and_id
- books_and_stationery
- water_bottles_and_drinkware
- other

### `item_type`

DRAFT: not agreed with teammate.

- earbuds
- headphones
- phone
- laptop
- tablet
- charger
- calculator
- watch
- backpack
- tote_bag
- purse_or_wallet
- jacket
- sweater_or_hoodie
- hat
- scarf
- gloves
- glasses
- sunglasses
- jewelry
- keys
- id_card
- water_bottle
- umbrella
- notebook
- textbook
- other

### `colors`

DRAFT: not agreed with teammate.

- black
- white
- gray
- brown
- beige
- red
- orange
- yellow
- green
- blue
- purple
- pink
- silver
- gold
- multicolor

### Campus locations (`area`)

To be filled by G. Real Emory buildings and areas go here. Both sides (the Lost flow and the Found flow) must use the same list.

- (empty)

---

## 5. Handoff to messaging (not a tool)

- The widget shows for the **best match only**, with a **Message** button.
- The button goes to the anonymous FoundYou inbox. The server routes to the finder using `finder_id`, which stays server-side.
- The assistant refers to the button but never acts on it. It never sees contact details or messages.

---

## 6. Open questions for the teammate

1. Can the image model output `detected_text`?
2. Do you agree with `area` / `location_detail`?
3. Who marks an item `resolved`: the finder, or the person who lost the item?
4. Tool names: `search_items` / `get_item`, or the memo's `search_lost_items` / `get_lost_item`?
5. What does the Message button call, and what does it pass?
6. G will provide the campus locations list (real Emory buildings and areas). Please confirm it works for the Found flow, since both sides must use the same list.

---

## 7. Deferred (not part of v1)

Recorded as questions only. Nothing is promised, and nothing here is designed.

- After a user says "not mine," should the next candidate replace the widget?
- Should `search_items` be able to skip rejected items (for example, an optional `exclude_ids` input)?

G decides after v1 testing. The Figma teammate weighs in on the UI side.
