# Lost & Found Image Matcher

**Project Narrative and Project Micro-Charter**

## 1. Project Narrative

The Lost & Found Image Matcher is a campus web application designed to make lost-and-found faster, more searchable, and less dependent on luck. In a typical campus lost-and-found process, students may have to check physical desks, bins, group chats, or spreadsheets to see whether an item has been turned in. This project creates one place where users can report both lost and found items and receive help identifying likely matches.

A person who finds an item can upload a photo and basic information such as the category, color, location, and date. A person who loses an item can submit a lost-item report with a photo or description. The system will compare newly uploaded found-item photos against open lost-item reports using basic image similarity. It will also use metadata such as category, color, date, and location to improve the ranking of likely matches. Instead of automatically deciding that two items are the same, the system will present a ranked list of candidate matches for a user or administrator to review. Once a match is confirmed, the owner of the lost item will receive an email notification with the relevant details.

The semester MVP will focus on the core end-to-end flow: reporting a lost or found item, storing the information, generating likely matches, confirming a match, and notifying the owner. The project will use a pretrained image model rather than training a custom model from scratch. Features such as a native mobile app, real-time chat, payment handling, and multi-campus support are outside the current scope. Success means that the system can complete the full report-to-match-to-notification process and that the team can evaluate matching quality using a small labeled test set rather than relying only on a visual demo.

Sustainability is part of the project in both a practical and environmental sense. Helping users recover items can reduce unnecessary replacement purchases and extend the useful life of phones, bags, electronics, and other belongings. From a technical perspective, using a pretrained model reduces the computing resources and development effort required compared with training a large model from scratch. The system will also keep its infrastructure lightweight, avoid unnecessary storage, and define a retention policy for resolved reports and images. Keeping the project modular and well documented will make it easier for future teams to maintain or improve the system without rebuilding it from the beginning.

## 2. Project Micro-Charter

### Mission Statement

Create a simple and reliable campus lost-and-found system that helps students and staff recover belongings faster by using image similarity and basic item information to connect found items with likely owners.

### Elevator Pitch

For students and staff who lose personal belongings on campus, the Lost & Found Image Matcher is a web application that turns scattered lost-and-found reports into searchable, ranked matches. Users upload a photo and short description of a lost or found item, and the system compares images and metadata to surface the most likely matches and notify the owner. Unlike a physical lost-and-found bin or an unsorted spreadsheet, the system allows users to search remotely and focuses attention on the most promising matches first.

### Risks and Mitigations

1. **Risk:** Image similarity gives incorrect matches because of lighting, angles, or visually similar items.
   **Mitigation:** Combine image similarity with category, color, date, and location. Require human confirmation before a match is finalized.

2. **Risk:** Too many low-confidence matches create notification spam.
   **Mitigation:** Only notify users for high-confidence matches or after an explicit match confirmation.

3. **Risk:** Users may be uncomfortable with photos or contact information being stored.
   **Mitigation:** Require authenticated accounts, limit exposed personal information, and define a retention/deletion policy for resolved reports.

4. **Risk:** The team takes on too many extra features and misses the core workflow.
   **Mitigation:** Protect the MVP. Cut optional features before cutting the report, match, confirm, and notify flow.

5. **Risk:** The project has too little data to judge whether the matching works.
   **Mitigation:** Build a small labeled test set early and report a measurable matching metric during the final demo.

### Trade-offs

- **Accuracy vs. speed:** More filtering and model processing may improve match quality, but it can also slow the reporting experience. The MVP will favor a fast, understandable pipeline with enough accuracy to be useful.
- **Automation vs. human control:** Automatic matching is convenient, but a wrong automatic claim could create confusion. The system will recommend likely matches while a user or administrator confirms the final match.
- **Feature breadth vs. semester scope:** Features such as real-time chat, a native mobile app, advanced moderation, and custom model training could be useful, but they increase schedule risk. The core lost/found matching flow comes first.
- **Model sophistication vs. cost and sustainability:** Training a custom model may improve performance, but it requires more data, computing power, and time. A pretrained model is more realistic and resource-efficient for this project.
- **Convenience vs. privacy:** Directly sharing personal contact information could make returns faster, but it creates privacy concerns. Notifications should be routed through the platform or email instead of exposing personal details automatically.

### Success Criteria

- A user can submit a lost-item report and a found-item report through the web application.
- A new found-item report produces a ranked list of likely lost-item matches.
- A user or administrator can confirm a match.
- The owner of the lost item receives a notification after confirmation.
- The team reports at least one measurable matching-quality metric using a labeled test set.
- The full upload-to-match-to-notification flow works end to end without manual data editing.