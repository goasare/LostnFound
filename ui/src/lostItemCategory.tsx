import {
  Search,
  Backpack,
  Laptop,
  BottleWine,
  Shirt,
  Contact,
  KeyRound,
} from "lucide-react";
import "./lostItemCategory.css";

const categories = [
  { id: "bookbag", label: "Bookbag", icon: Backpack },
  { id: "technology", label: "Laptop & Technology", icon: Laptop },
  { id: "bottle", label: "Water Bottle", icon: BottleWine },
  { id: "clothes", label: "Clothes & Apparel", icon: Shirt },
  { id: "wallet", label: "ID, Wallet & Lanyards", icon: Contact },
  { id: "keys", label: "Keys & Accessories", icon: KeyRound },
];

export default function LostItemCategory() {
  // Keep Bookbag selected while this page is design-only.
  const selectedCategory = "bookbag";

  // Add these actions when the other pages are ready.
  // const handleCategorySelect = (categoryId) => {};
  // const handleBackHome = () => {};
  // const handleGoBack = () => {};
  // const handleContinue = () => {};

  return (
    <div className="category-page">
      <header className="page-header">
        <div className="logo">
          <span className="logo-icon">
            <Search size={17} aria-hidden="true" />
          </span>
          <span>FoundYou</span>
        </div>

        <button
          type="button"
          className="home-button"
          aria-disabled="true"
          // onClick={handleBackHome}
        >
          Back to home
        </button>
      </header>

      <main className="category-main">
        <span className="step-label">
          STEP 1 OF 3 · NARROW DOWN SEARCH
        </span>

        <h1>Tell us what you lost.</h1>

        <p className="page-description">
          Select a category to help narrow down the visual matching database.
        </p>

        <div className="category-grid" aria-label="Lost item categories">
          {categories.map(({ id, label, icon: Icon }) => {
            const isSelected = selectedCategory === id;

            return (
              <button
                key={id}
                type="button"
                className={`category-card ${isSelected ? "selected" : ""}`}
                aria-pressed={isSelected}
                aria-disabled="true"
                // onClick={() => handleCategorySelect(id)}
              >
                <span className="category-icon">
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                </span>

                <span className="category-name">{label}</span>

                <span className="category-hint">
                  {isSelected ? "Selected category" : "Click to select"}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="page-footer">
        <button
          type="button"
          className="back-button"
          aria-disabled="true"
          // onClick={handleGoBack}
        >
          Go Back
        </button>

        <button
          type="button"
          className="continue-button"
          aria-disabled="true"
          // onClick={handleContinue}
        >
          Continue
        </button>
      </footer>
    </div>
  );
}
