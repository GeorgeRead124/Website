# A Love Without End

A static website (plain HTML/CSS/JS, no build step) — perfect for GitHub Pages.

## Run locally
    python3 -m http.server 8000     # then open http://localhost:8000
(or `npx serve`). Opening index.html by double-click also works.

## Music
Put your own MP3 at `assets/audio/romantic-music.mp3` (use a song you have the rights to).
If the file is missing, a soft synthesized ambient melody plays instead.
The speaker button (top-left) pauses/resumes and remembers her choice.

## Deploy on GitHub Pages
1. Create a new GitHub repository (e.g. `a-love-without-end`) and upload ALL files in this folder
   (index.html, style.css, app.js, translations.js, assets/, README.md).
2. Repo → Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save.
3. After ~1 minute your link will be: https://YOUR-USERNAME.github.io/a-love-without-end/
Send her that link (best opened on her phone with sound on).

## Customize
- Phrases: edit `translations.js` (every language shown in the heart lives there).
- Letter: edit the `<p class="ln">` lines in `index.html`.
