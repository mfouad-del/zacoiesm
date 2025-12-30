# IEMS Backend

Production-ready backend for Integrated Engineering Management System.

## Tech Stack
- Node.js
- TypeScript
- Express.js
- Supabase (Database)
- JWT (Authentication)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file based on `.env.example` (if available) or ensure the following variables are set:
   ```
   PORT=3000
   JWT_SECRET=your_secret_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Start production server:
   ```bash
   npm start
   ```

## Architecture
- **Core**: Constants, Enums, Shared Logic.
- **Modules**: Feature-based modules (Costs, Planning, Quality, etc.).
- **Engines**: Pure logic classes (EVM, CPM, etc.).
- **Middlewares**: Auth, Validation, Error Handling.
