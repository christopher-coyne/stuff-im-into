# Stuff I'm Into

A media curation app where users create tabs and reviews to share what they're into.

## Tech Stack

### Frontend (`/frontend`)
- React 19 + React Router 7
- TanStack React Query
- React Hook Form
- Tailwind CSS 4 + Radix UI
- Supabase Auth
- TypeScript + Vite

### Backend (`/backend`)
- NestJS 11
- Prisma ORM
- Supabase Auth
- Swagger/OpenAPI
- TypeScript

## Commands

```bash
# Frontend
cd frontend && npm run dev          # Dev server
npm run api:generate                 # Regenerate API client from Swagger

# Backend
cd backend && npm run start:dev      # Dev server
npm run db:reset                     # Reset DB and reseed
npx prisma studio                    # Database GUI
```
