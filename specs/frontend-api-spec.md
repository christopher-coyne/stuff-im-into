# Stuffiminto — Frontend Routes Specification

## Overview

Remix routes mapped to backend API endpoints.

**Data fetching strategy:**

- Initial page data → Remix loaders (SSR)
- Mutations → React Query (client-side, calls NestJS directly)

---

## Routes

### Public Routes (No Auth Required)

|Route|Page|Loader Endpoints|
|---|---|---|
|`/`|Homepage / Landing|—|
|`/explore`|Explore users|`GET /users`|
|`/@:username`|User's list page|`GET /users/:username`, `GET /users/:username/tabs`, `GET /users/:username/reviews`|
|`/@:username/:reviewId`|Single review page|`GET /users/:username/reviews/:reviewId`|
|`/login`|Login page|— (Supabase Auth)|
|`/signup`|Signup page|— (Supabase Auth)|

---

### Protected Routes (Auth Required)

|Route|Page|Loader Endpoints|
|---|---|---|
|`/settings`|Edit profile, view bookmarks|`GET /users/me`, `GET /bookmarks/users`, `GET /bookmarks/reviews`|
|`/new`|Create new review|`GET /tabs`, `GET /categories`|

---

### Conditional Data Loading (Owner vs Visitor)

|Route|Visitor|Owner (additional data)|
|---|---|---|
|`/@:username`|Public endpoints only|`GET /tabs`, `GET /reviews` (includes drafts)|
|`/@:username/:reviewId`|Public endpoint only|`GET /reviews/:reviewId` (draft access)|

---

## Summary

| Type            | Count |
| --------------- | ----- |
| Public pages    | 6     |
| Protected pages | 2     |
| **Total pages** | **8** |
