# Watch & Bracelet Store

React + JSX + CSS project converted from the AI-generated `watch-bracelet-store.jsx`.

## Run
npm install
npm run dev

## Edit
Open `src/App.jsx`.
Find `DEFAULT_SETTINGS` to edit your brand name, tagline, phone, WhatsApp, email, social links, address, delivery charge, currency, return policy and payment methods.

Find the sample product data to change product names, prices, descriptions and image URLs.

## Storage note
The original file uses `window.storage`. This project includes a browser `localStorage` fallback so it runs normally. This is NOT a shared online database.

For a real production store, add secure admin authentication and a hosted database such as Supabase/Postgres before accepting real orders.

## Deploy
Push the project to your own GitHub repository and deploy the Vite app with a static hosting provider such as Vercel or Netlify.
