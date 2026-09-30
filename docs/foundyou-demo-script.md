# FoundYou Assistant: Demo Scripts

Four demo scripts for the presentation. Each was tested against the real model with `TODAY_OVERRIDE=2026-09-29`, which must be set in `.env` for the demo. Click **New conversation** before each one.

---

## Demo 1: Easy match

1. I lost my silver macbook
2. I think I left it somewhere in Woodruff Libs
3. I don't really remember besides sometime on Sunday

**Expected:** one search result (`item_0008`), no narrowing question, one card, "This could be a match. Take a look, and you can message the finder to check."

---

## Demo 2: Extra questioning

1. I lost my white Apple earbuds
2. I think around Woodruff Libs
3. I'm not 100% but I think it was Sunday
4. It has a star sticker on the case

**Expected:** after line 3, the stand-out question; after line 4, one card for `item_0001`. `item_0007` never appears.

---

## Demo 3: Not found yet

1. I lost my earbuds
2. I think I left them around the Business school
3. Maybe around yesterday midday

**Expected:** the no-results line. There are no earbuds at Goizueta.

---

## Demo 4: Finder redirected

1. Hey, I found some earbuds earlier today

**Expected:** the finder redirect line, with no other features described.
