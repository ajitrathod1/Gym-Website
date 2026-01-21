# BOOST FITNESS CLUB - Local Setup (Windows / VS Code)

## 1) FRONTEND
- Open project folder in VS Code.
- Open any page (index.html) in browser (double click) OR host via Live Server extension.

## 2) BACKEND (Node.js)
- Open terminal in project/server folder.
- Run:
  ```bash
  npm install
  ```
- Create a file `server/.env` (copy `.env.example`) and fill:
  ```env
  EMAIL_USER=yourgmail@gmail.com
  EMAIL_PASS=your_app_password
  ```
- Start server:
  ```bash
  node server.js
  ```
- Server listens on http://localhost:5000

## 3) FORMS
- Contact & Join forms post to backend endpoints:
  - `POST http://localhost:5000/api/contact`
  - `POST http://localhost:5000/api/join`
- After backend running, submit forms from frontend. You should receive an email to EMAIL_USER.

## 4) ASSETS
- Replace placeholder images in `/assets` with real images (same filenames) for best look.

## 5) DEPLOY
- **Frontend**: Netlify/Vercel (static)
- **Backend**: Render/Heroku with environment variables set for EMAIL_USER & EMAIL_PASS

If any error appears (CORS / SMTP), paste error here and I will help fix.
