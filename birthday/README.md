# 10/10 — David Mutua

A static birthday page built with HTML, CSS, and vanilla JavaScript. No build step or backend is needed.

## Preview

Open `index.html` in a browser. Google Fonts and Unsplash photos need an internet connection; the site itself has no package dependencies.

## Personalize

- Copy your portrait into the project's `images` folder and name it `david-mutua.jpg`. The page reads it from `images/david-mutua.jpg` and reveals the portrait once it loads.
- Replace the Unsplash photo URLs in `index.html` with your own images, and update their alt text and captions.
- The countdown targets October 10, 2026 in each visitor's local time. Change `countdownTarget` in `script.js` to use another date.
- The birthday age is intentionally left out until the birth year is known.
- The optional sound is synthesized by the browser and starts only when a visitor turns it on.

## Publish with GitHub Pages

Before publishing, note that the phone number in the footer will be visible to anyone who can access the public site. Remove or replace it first if you do not want it shared publicly.

1. Create a GitHub repository. Upload `index.html`, `style.css`, `script.js`, `README.md`, and the complete `images` folder. Keep `index.html` at the repository root and preserve the image filename `images/david-mutua.jpg` exactly, including letter case.
2. Commit and push the files to the repository's `main` branch.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose the `main` branch and `/ (root)` folder, then save.
5. Wait for the deployment status to finish, then open and share the URL shown in the Pages settings.

All local stylesheet, script, and portrait URLs are relative, so they work both from a repository-root Pages site and a project subpath. Google Fonts and Unsplash photos require an internet connection.

This is a static site and does not need a server-side runtime.
