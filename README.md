# जीवन वचन — Nepali Bible

A responsive React Bible reading and listening experience for all ages.

## Development

```bash
npm install
npm run dev
```

The Vite development middleware and `/api/bible` Vercel Function proxy the free [bible-api.com](https://bible-api.com) service. The public API is used for the English WEB test translation; the product UI is Nepali-first.

## Deployment

Import this directory into Vercel or run `vercel`. No environment variables are required for the testing API. Static audio is served from `public/audio`.

## Included

- All 66 books and chapter counts
- Responsive library and distraction-free reader
- Chapter navigation and live passage loading
- Persistent bookmarks, reading position, theme, and text size
- Nepali Genesis audio player with three supplied chapters
- Dark mode and reduced-motion accessibility
