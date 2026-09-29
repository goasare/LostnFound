# FoundYou Assistant: Plan Decisions

**Date:** 2026-09-29
**Owner:** G
**Sources:** meeting notes, teammate voice memo, G's review, and G's walkthrough decisions

---

## Instructions for Jarvis

- This is the decisions record for G's side of FoundYou.
- **Go-ahead given by G on 2026-09-29.** The plan is final for v1. TaskBot may be assigned work, but only through the Linear agent, and Linear tickets are created only when G explicitly approves each one.
- **Linear agent:** it works for G in the shared **FoundYou** workspace. It can read all tickets. Once the plan is final, it may also **create tickets, but only ones G explicitly approves**.
- Anything marked **Deferred** waits until the working basis is built and tested. Don't raise or build it early.
- Treat this file as the source of truth, and update it only when G confirms a decision.

---

## 1. Scope and roles

- The assistant serves the **person who lost an item**. The Found flow is out of scope.
- **User flow:** login → "Found something" / "Lost something." Lost opens G's chat.
- **G owns:** the chat app (React chat UI + widget), the agent loop, tool design, the schema, and the system prompt.
- **Teammate owns:** image recognition and the real backend (database, real search).
- **Scope:** the finder keeps the item. No drop-offs, and edge cases come later.
- **Assistant's job:** find the most similar found item and connect the person who lost it with the finder. **It does not play judge.**

## 2. Model and setup

- **Provider:** OpenRouter. Switching models means editing one line (`OPENROUTER_MODEL`).
- **First candidate:** GPT-6 Luna (`openai/gpt-6-luna`), at $0.10 / $0.50 per 1M tokens in/out. It supports tools.
  - Confirm the slug before use.
- **Selection rule:** choose the cheapest model that reliably:
  1. Asks the right questions
  2. Searches correctly
  3. Skips wrong items
  4. Never leaks finder info
- **Evals:** about 10 practice conversations, run on 3–4 cheap models. Keep the cheapest one that passes all of them.
- **If Luna isn't smart enough:** raise its reasoning effort first, then consider moving up a tier (Sol).
  - Check early that tool calls still work at higher effort, since OpenAI's Chat Completions limits function calling to effort "none." OpenRouter may differ.
- **Vision:** the chat model does not need it. Image recognition turns photos into text fields at finder upload.
- **Mock mode:** `MOCK_MODE=true` runs the app with no key and no cost.

### Setup
1. **OpenRouter account:** G's account with prepaid credit. The prepaid credit acts as the budget cap.
2. **Env files:**
   - `.env` holds real values and is never committed.
   - `.env.example` holds placeholders and is committed.
   ```
   OPENROUTER_API_KEY=your-key-here
   OPENROUTER_MODEL=openai/gpt-6-luna
   MOCK_MODE=true
   ```
3. **Gitignore check:** confirm `.env` is gitignored with `git check-ignore .env`. If a key is ever committed, revoke it and make a new one.
   - **Who does what (decided 2026-09-29):** TaskBot's first task, in this order: (1) add `.env` to `.gitignore`, (2) run `git check-ignore .env` to confirm, (3) create `.env.example` with placeholders, (4) create `.env` with the same variable names and `OPENROUTER_API_KEY` left blank (`MOCK_MODE=true`). G checks the ignore rule is in place before step 4, then pastes in the key personally. TaskBot never writes a key into any file.
4. **Stack:** TypeScript + React + Vite. TaskBot chooses the exact setup.
5. **Vite rule:** never prefix the key with `VITE_`, since that bundles it into the browser. Only server-side code reads the key.

### Key ownership
- G owns the key for the initial demo.
- G's bots may use the real key when a run needs it. Otherwise, keep `MOCK_MODE` on.
- Never paste the key in Linear, Slack, or GitHub.
- Teammates use mock mode or their own key.
- The team revisits key ownership when the app is deployed for real users.

### Build vs. run
- **TaskBot builds:** everything on G's side, including the chat UI, agent loop, endpoint, mocks, and test app.
- **The finished app runs:** it's what calls OpenRouter. TaskBot never does at runtime.
- **Key must be server-side:** the agent loop runs server-side so the key is never exposed in the browser.

## 3. Assistant design

- **One agent.**
- **Intake (system prompt):** what was lost, roughly where, and when. Nudge for location if it's missing. Personality comes later.
- **Tools** (max 3, currently 2): `search_items` and `get_item`.

### search_items input
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
- **item_type:** required, from a fixed list.
- **colors, brand:** optional. Used for ranking, not filtering.
- **keywords:** optional free text.
- **area, time window:** optional for now (see Search limits).

### search_items output
- Up to **5** summaries: `id`, type, color, area, date.
- No image and no full details.

### get_item output
- The full **public** record, including `image_url`.
- Only `get_item` returns `image_url`.

### Narrowing flow
1. Intake: what, where, when.
2. `search_items` returns up to 5 summaries.
3. If too many results or several are close, the assistant **asks open questions** so the user supplies the distinguishing details, or it sharpens the search using details already given.
   - Rule: **never mention a candidate detail the user hasn't already said.**
   - ✅ "Is there anything that would make yours stand out, like marks, damage, a case, or anything attached?"
   - ❌ "Did yours have a sticker on the case?"
   - Wording for v1 is agreed (see "Question wording (v1)" below). G revisits it after testing.
4. Once it believes it has the **best match**, or up to 3 close candidates, it calls `get_item` for each, and the widgets appear.

### Question wording (v1)
Draft wording for the system prompt. G tests v1 and adjusts.
- **Tone:** neutral for now. G decides the tone after testing v1.
- **Rules:** open questions only, one at a time; never mention a candidate detail the user hasn't said; never say "this is yours"; stop at 3 or fewer candidates, one clear best match, or about 4 questions.
- **Do not mention how many results there are.** Revisit after testing.
- **Intake:**
  - What: "What did you lose?"
  - Where: "Roughly where do you think you lost it?" If skipped: "Even a general area helps, like a building or part of campus."
  - When: "About when was that? A rough day or time is fine."
- **Narrowing:**
  - "Is there anything that would make yours stand out, like marks, damage, a case, or anything attached?"
  - "Can you tell me a bit more about it, like the color, brand, or size?" (kept for now; change it if testing shows a problem)
  - "Anything else you remember about it?"
  - "Where were you when you last had it?"
- **Too many results:** "Can you tell me more about yours?" (no count, no candidate details)
- **Best match:** "This could be a match. Take a look, and you can message the finder to check."
- **Several close after the stop rule:** show them equally, without calling one "the" answer.
- **No results:** "I don't see anything that fits yet. Items get added as people find them, so it's worth checking back." Do not promise a notification.
- **Vague user:** nudge once ("Even a rough idea helps"), then search with what is known.
- **Testing focus for v1:** the case where the item was found and the assistant should reach the right one. The no-result case is secondary.

### Widget and messaging
- **When it shows:** Widgets appear only at the final step: for the best match, or for up to 3 close candidates after the stop rule, shown equally. Not a browsing tool.
- **What it shows:** image, description, details, and a **Message** button.
- **Messaging is a button, not a tool.** The assistant never sends, reads, or relays messages.
- **How messaging works:** messages go through the anonymous FoundYou inbox, where the two people coordinate. The assistant's role ends at the widget.
- **Wording direction:** "Possible match," "Message the finder," never "this is yours."
- **Messaging details** (not G's to build, but they affect the flow):
  - Anonymity in both directions
  - Free-text vs. prefilled first message
  - Spam limits
  - Framing messaging as an inbox (not live chat) may resolve the charter's "no real-time chat" conflict

### Privacy
- The finder stays anonymous.
- No sensitive info goes in the system prompt.
- No personal info is given out because someone claims an identity.

## 4. Schema

### Lost Item record
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

- **server_only:** never sent to the model or the browser.
  - `finder_id` routes messages to the finder.
  - `detected_text` is sensitive text read off the item. **Kept in the data for now but unused.** It shows the public/server-only split, and tests can confirm it never appears in a tool result. Can be removed later if it causes issues or the image model can't produce it.
  - `status` is `available` or `resolved`. The server returns only `available` items in `search_items`, so resolved items drop out of search. The assistant never sees `status`.
- **Fixed lists** shared with image recognition: category, item_type, colors, and **campus locations**. `category` and `item_type` each include an `other` value so unusual items can still be searched.
- **Photo-only rule:** only include fields a real photo can produce. The "contents" field was cut for this reason.
- **Location and time:**
  - The finder enters `area` from the campus list, plus an optional `location_detail`. `area` matches the `area` field in `search_items`.
  - Time defaults to the upload time and is editable.
  - Photo metadata isn't used (unreliable, and a privacy risk).
  - The assistant turns the user's "where/when" into `area` plus a time window. Search matches items found in that area after the loss time.
  - Request to whoever builds the Found flow: use the same location list, and default the time to upload time.
- **Dummy data:** real Emory places and realistic times.
- **Revisit later:** whether visible marks (e.g., "star sticker") are public or server_only.
  - Hidden fields can still be used for ranking on the server.

## 5. Backend and mocks

- **Contract:** agree with the teammate on:
  - `search`: input fields → up to 5 summaries
  - `get item`: `id` → public record

  The mocks match this exactly, so switching to the real backend is a one-line change.
- **Mock relevance scoring** (no AI needed):
  1. Filter by `status` = available and item_type (plus area and time if given).
  2. Add points for matching colors, brand, and keywords.
  3. Sort and return the top 5.
- **G's workflow:**
  1. TaskBot builds the mocks.
  2. G tests how the assistant answers.
  3. G works out which data specifics give better responses.
  4. G relays those to the teammate.

## 6. Process

- **Starter focus:** a test web app with realistic dummy data (fake images and item records), before the real UI exists.
  - The JSON must match what image recognition actually outputs.
- **Practice conversations:** the assistant finds the right item and never surfaces obviously wrong ones (e.g., a MacBook for lost earbuds).
- **Where things live:** planning docs in `docs/`, and Linear stories for context.
- **Tool test:** "If I were the LLM with only these tools, could I do the job?"
- **Deliverable (for sharing):** define what `search_items` and `get_item` take in and return, and design the item record: photo-visible details plus where and when it was found, split into public and server-only parts.
- **Deliverable (G's checklist):**
  1. `search_items`: input fields and the summary it returns
  2. `get_item`: the full public details it returns, including `image_url`
  3. Item record: public vs. server-only fields
  4. Fixed lists for category, item_type, colors (and locations), shared with image recognition

## 7. Known conflicts to resolve

1. **.env gitignore:** confirm `.env` is gitignored.
2. **TaskBot's folders are too narrow.** Expand them to cover:
   - App code
   - Server/mock folder
   - `docs/`
   - Keep `.env` access to runs that need it.
3. **Linear story creation:** resolved. The Linear agent creates only the tickets G approves.
4. **Charter:** "no real-time chat" vs. in-app messaging. The inbox framing may resolve it.
5. **Widget photo vs. hidden details for high-risk items:** deferred (see Security).

## 8. Search limits

- **Now:** area is optional (Option A), so the program works first.
- **Later:** require an area **or** a time window (Option C).
- The 5-result cap stays either way.

---

## Deferred (after the working basis works)

- **Security / anti-gaming / verification.** The stance is set: the assistant filters, and the finder verifies. Deferred items:
  - `check_detail(item_id, user_description)` verification tool: the server compares and returns only a match strength
  - Public vs. hidden visible marks
  - Hiding photos for high-risk items (category icon instead)
  - Message spam limits
  - Future Linear story: "I'm getting spammed by false claimants"
  - Showing up to 3 close candidates increases item exposure. Review with anti-gaming.
- **Student login.** Possible cut. Admin auth is separate.
- **Photo upload by the person who lost the item.** If added, route it through the teammate's image recognition so the chat model stays text-only.
- **TaskBot task list.** G handles this through Linear and Jarvis.
- **Drop-off flows.**

## Pending with G (do not resolve)

- **Vite:** resolved. TaskBot chooses the exact setup (browser page plus a small server for the agent loop and key). G observes and tests.
- **Open-question wording:** resolved for v1 on 2026-09-29 (see "Question wording (v1)" in Section 3). G revisits tone, the no-count rule, and the color/brand/size question after testing.
- **Schema:** resolved on 2026-09-29 (see Section 4). Still to confirm with the teammate: whether the image model can output `detected_text`, whether they agree with `area` / `location_detail`, and who sets `status` to `resolved` (the finder, or the person who lost the item).

## Cut (vault)

- **Two-agent design:** too complex, and it doesn't stop gaming. Intake moved into the system prompt.
- **"contents" field:** a photo can't show what's inside an item, and the field creates fake eval confidence.
- **"Created the presentation"** transcript line.
