# Resume Maker Backend

Backend service for the Resume Maker platform.

It provides:
- Authentication with JWT in HTTP-only cookies
- AI-driven interview report generation
- Resume PDF parsing and analysis
- ATS-friendly resume PDF generation with Puppeteer
- Report history APIs for each logged-in user

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT + cookie-based auth
- Multer (in-memory file upload)
- pdf-parse
- Puppeteer
- Google GenAI + Zod

## Architecture

The backend follows a modular, layered structure:

- Routes layer: Defines API endpoints and middleware chains
- Controller layer: Handles request/response logic
- Middleware layer: Auth guard and file upload handling
- Model layer: Mongoose schemas and persistence
- Service layer: AI integration and helper utilities
- Config layer: Database connection and app configuration

### Request Flow

1. Client calls API endpoint
2. Route applies middleware (auth / upload)
3. Controller validates and orchestrates logic
4. Services perform AI/PDF processing if needed
5. Models read/write MongoDB
6. Controller returns JSON or file response

## Folder Structure

```text
Backend/
  .env
  .gitignore
  package.json
  package-lock.json
  server.js
  src/
    app.js
    config/
      database.js
    controllers/
      auth.controller.js
      interview.controller.js
    middleware/
      auth.middleware.js
      file.middleware.js
    models/
      user.model.js
      blacklist.model.js
      interviewReport.model.js
    routes/
      auth.routes.js
      interview.routes.js
    services/
      ai.service.js
      temp.js
```

## Environment Variables

Create a `.env` file in `Backend/`:

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/resume-maker-ai
JWT_SECERET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

Notes:
- Keep `.env` private and never commit real secrets.
- The variable name in code is currently `JWT_SECERET` (spelling must match code).

## Installation and Run

```bash
npm install
npm run dev
```

Production mode:

```bash
npm start
```

## API Base URL

When running locally:

```text
http://localhost:8000
```

## API Endpoints

### Auth

- `POST /api/auth/sign-up`
  - Create a new user
  - Body: `username`, `email`, `password`

- `POST /api/auth/login`
  - Login user
  - Body: `email`, `password`
  - Sets `token` cookie

- `GET /api/auth/logout`
  - Logs out user
  - Clears cookie and blacklists token

- `GET /api/auth/me`
  - Returns authenticated user
  - Requires valid auth cookie

### Interview Reports

- `POST /api/interview`
  - Generate interview report from resume + job description
  - Requires auth
  - `multipart/form-data` fields:
    - `resume` (PDF, max 3MB)
    - `selfDescription`
    - `jobDescription`

- `GET /api/interview/reports`
  - Get all reports for logged-in user
  - Requires auth

- `GET /api/interview/report/:id`
  - Get one report by id
  - Requires auth

- `GET /api/interview/report/:id/resume-pdf`
  - Generate and download ATS-friendly resume PDF
  - Requires auth

## Data Models (Summary)

### User

- `username` (unique)
- `email` (unique)
- `password` (hashed)

### InterviewReport

- `jobDescription`
- `resume`
- `selfDescription`
- `title`
- `matchScore` (0-100)
- `technicalQuestions[]`
- `behavioralQuestions[]`
- `skillGaps[]`
- `preparationPlan[]`
- `user` (ObjectId ref)
- timestamps

### Blacklist Token

- `token`
- timestamps

## Auth Details

- JWT token is stored in `token` cookie
- Protected routes use `auth.middleware.js`
- Blacklisted tokens are blocked after logout

## Known Notes

- CORS origin is configurable with `FRONTEND_URL`
- Resume upload is in-memory and limited to 3MB
- Puppeteer must be installed correctly for PDF generation

## Scripts

- `npm run dev` - Start with nodemon
- `npm start` - Start with Node
