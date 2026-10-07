import { Search, Upload, CircleCheck, Clock3, ShieldCheck } from "lucide-react";

// Design-only page. Connect these handlers when the related flows are ready.
// const handleAbout = () => {};
// const handleUpdates = () => {};
// const handleSignIn = () => {};
// const handleUploadImage = () => {};
// const handleReportFoundItem = () => {};

export default function Home() {
  const handleReportLostItem = () => {
    window.location.assign("/lost/category");
  };

  return (
    <main>
      <section className="dark-section">
        <header className="header">
          <div className="brand"><span className="brand-icon"><Search size={21} strokeWidth={2} /></span><span>FoundYou</span></div>
          <nav aria-label="Main navigation">
            <button type="button" className="nav-button" aria-disabled="true"
              // onClick={handleAbout}
            >About</button>
            <button type="button" className="nav-button" aria-disabled="true"
              // onClick={handleUpdates}
            >Updates</button>
            <button type="button" className="sign-in" aria-disabled="true"
              // onClick={handleSignIn}
            >Sign In</button>
          </nav>
        </header>
        <div className="hero">
          <span className="eyebrow">SECURE CAMPUS MATCHING</span>
          <h1>Find what you lost.<br />Return what you found.</h1>
          <p className="intro">Upload a photo or describe your item — we&apos;ll scan campus reports<br className="desktop-break" /> instantly and guide you the rest of the way.</p>
          <div className="search-bar">
            <Search className="search-icon" size={21} aria-hidden="true" />
            <label className="sr-only" htmlFor="item-description">Describe your lost item</label>
            <textarea id="item-description" rows={2} placeholder="What are you looking for? e.g. Blue backpack, water bottle" />
            <button type="button" className="upload-button" aria-disabled="true"
              // onClick={handleUploadImage}
            ><Upload size={17} aria-hidden="true" />Upload Image</button>
          </div>
          <div className="report-actions">
            <button type="button" className="report-button lost"
              onClick={handleReportLostItem}
            >Report Lost Item</button>
            <button type="button" className="report-button found" aria-disabled="true"
              // onClick={handleReportFoundItem}
            >Report Found Item</button>
          </div>
          <p className="trust-line">Powered by visual matching · Secure Campus Network</p>
        </div>
      </section>
      {/* Display-only statistics reproduced from the supplied design. */}
      <section className="stats" aria-label="FoundYou at a glance">
        <div className="stats-inner">
          <div className="stat"><span className="stat-icon"><CircleCheck size={23} strokeWidth={1.6} /></span><div><strong>128</strong><p>items reunited this term</p></div></div>
          <div className="stat"><span className="stat-icon"><Clock3 size={23} strokeWidth={1.6} /></span><div><strong>&lt;2 min</strong><p>to report an item</p></div></div>
          <div className="stat"><span className="stat-icon"><ShieldCheck size={23} strokeWidth={1.6} /></span><div><strong>Verified</strong><p>before every return</p></div></div>
        </div>
      </section>
    </main>
  );
}
