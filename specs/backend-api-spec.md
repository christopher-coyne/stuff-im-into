# Stuffiminto — Backend API Specification (Simplified)

## Overview

Base URL: `/api/v1`  
Authentication: Supabase JWT via `Authorization: Bearer <token>`

---

## Modules & Endpoints

### Auth Module

No endpoints — provides `SupabaseAuthGuard` and `@CurrentUser()` decorator.

---

### Users Module

|Method|Endpoint|Auth|
|---|---|---|
|GET|`/users`|Public|
|GET|`/users/:username`|Public|
|GET|`/users/me`|Required|
|PATCH|`/users/me`|Required|

---

### Tabs Module

|Method|Endpoint|Auth|
|---|---|---|
|GET|`/users/:username/tabs`|Public|
|GET|`/tabs`|Required|
|POST|`/tabs`|Required|
|PATCH|`/tabs/:tabId`|Required|
|DELETE|`/tabs/:tabId`|Required|
|PATCH|`/tabs/reorder`|Required|

---

### Reviews Module

|Method|Endpoint|Auth|
|---|---|---|
|GET|`/users/:username/reviews`|Public|
|GET|`/users/:username/reviews/:reviewId`|Public|
|GET|`/reviews`|Required|
|GET|`/reviews/:reviewId`|Required|
|POST|`/reviews`|Required|
|PATCH|`/reviews/:reviewId`|Required|
|POST|`/reviews/:reviewId/publish`|Required|
|DELETE|`/reviews/:reviewId`|Required|
|PATCH|`/reviews/reorder`|Required|

---

### Categories Module

|Method|Endpoint|Auth|
|---|---|---|
|GET|`/categories`|Required|
|POST|`/categories`|Required|
|PATCH|`/categories/:categoryId`|Required|
|DELETE|`/categories/:categoryId`|Required|

---

### Bookmarks Module

|Method|Endpoint|Auth|
|---|---|---|
|GET|`/bookmarks/users`|Required|
|POST|`/bookmarks/users/:userId`|Required|
|DELETE|`/bookmarks/users/:userId`|Required|
|GET|`/bookmarks/reviews`|Required|
|POST|`/bookmarks/reviews/:reviewId`|Required|
|DELETE|`/bookmarks/reviews/:reviewId`|Required|

---

## Summary

| Module     | Endpoints |
| ---------- | --------- |
| Users      | 4         |
| Tabs       | 6         |
| Reviews    | 9         |
| Categories | 4         |
| Bookmarks  | 6         |
| **Total**  | **29**    |
