# Shem — personal portfolio

A responsive, buildless portfolio made with HTML, CSS, Vue 3, Tailwind CSS, and Three.js.

## View

Open index.html in a modern browser with internet access. No installation or build is required. Vue, Tailwind, Three.js, and Google Fonts load from pinned CDN URLs (Google Fonts supplies its current font files).

You can also serve this directory using any static web server. Publish index.html, style.css, and app.js together to any static host.

## Personalize

- Set CONTACT_EMAIL at the top of app.js to activate the email link.
- Replace the explicitly labeled concept projects in app.js with your own work.
- Edit the introduction and about text in index.html.
- Change palette variables at the beginning of style.css.

## Features

- Pointer-responsive Three.js sculpture with three color options and pause control.
- Reduced-motion preference support and a CSS fallback when WebGL is unavailable.
- Category filters and keyboard-accessible project dialogs.
- Responsive navigation, focus trapping, Escape to close, and focus restoration.
- No analytics, backend, or contact data collection.

## Dependencies and deployment

Tailwind's browser CDN is used for a zero-build setup. The visual design also has its own stylesheet. For a larger production project, migrate the dependencies to a package-based build and compile Tailwind locally.

This environment did not provide Node.js, npm, Git, or browser preview tooling. Browser rendering and hosted deployment have not been verified.
