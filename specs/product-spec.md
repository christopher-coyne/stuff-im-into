# Stuffiminto.com — Product Specification

## Overview

Stuffiminto is a site where users can upload their thoughts and reviews of different media, and have a personal page showing it. Think of it like a Linktree page, with a bunch of tabs for different media types (movies, poetry, songs, etc.)—basically anything the user inputs.

---

## Technology Stack

### Architecture Overview

|Layer|Technology|Notes|
|---|---|---|
|Frontend/SSR|Remix|Handles UI rendering, routing, and calls to NestJS backend|
|Backend API|NestJS|REST API for business logic and data access|
|Database|Supabase (Postgres)|Managed Postgres with generous free tier|
|ORM|Prisma|Type-safe database access, clean migrations|
|Auth|Supabase Auth|Email/password, OAuth providers, session management|
|File Storage|Supabase Storage|Profile pics, media review images|
|Hosting|DigitalOcean (single $12 droplet)|Docker Compose running Remix + NestJS containers|

### Infrastructure

**Single Droplet Setup**

Both Remix and NestJS run as separate Docker containers on one $12/month DigitalOcean droplet:

- Remix container (port 3000) — public-facing
- NestJS container (port 4000) — internal API, accessed via localhost
- Nginx or Caddy for SSL termination and routing

**Why one droplet:**

- Services communicate over localhost (no network latency)
- Shared CPU/RAM pool for better resource utilization
- Single deployment target, simpler ops
- Easy to split later if scaling demands it

### Database & Auth

**Supabase Free Tier Limits:**

|Resource|Limit|
|---|---|
|Database storage|500MB|
|File storage|1GB|
|Bandwidth|5GB|
|Monthly active users (auth)|50,000|
|Projects|2|

**Note:** Free tier projects pause after 1 week of inactivity. Upgrade to Pro ($25/month) when consistent traffic begins or pausing becomes disruptive.

**Auth Flow:**

1. User authenticates via Supabase Auth (Remix handles login UI)
2. Supabase returns a JWT
3. Remix stores the JWT and passes it to NestJS on API calls
4. NestJS verifies the JWT using Supabase's JWT secret

### File Storage

**Buckets:**

- `avatars` — profile pictures
- `media-images` — images for media reviews

**Upload Flow:**

1. User selects an image in the browser
2. Client-side compression via `browser-image-compression` (prevents 4MB phone photos for 200px avatars)
3. Upload directly to Supabase Storage using the JS client
4. Store the returned public URL in the database

**Bucket Policies:**

- Users can only upload/modify files in their own folder (`{userId}/`)
- Public read access for avatars and media images

### Estimated Monthly Costs

|Service|Cost|
|---|---|
|DigitalOcean droplet|$12|
|Supabase (free tier)|$0|
|**Total**|**~$12/month**|

Upgrade path when needed:

- Supabase Pro: +$25/month (more storage, no pausing, daily backups)
- Larger droplet: $24+ for more CPU/RAM if traffic grows

---

## Global Navigation

The site has a **main navigation bar** that appears on all pages.

**Main Nav (View Mode)**

- Not sticky (scrolls with page)
- Left: Stuffiminto logo (gradient icon + wordmark)
- Right: User avatar with "My List" link (when logged in), or "Log in" / "Sign up" buttons (when logged out)

**Edit Mode Toolbar**

- Replaces main nav when editing (on List Page or Media Review Page)
- Sticky (stays at top when scrolling)
- Amber background to clearly indicate edit state
- Left: "Exit Edit Mode" button + context label (e.g., "Editing review")
- Right: Draft indicator badge, "Save Draft" button, "Publish" button

---

## Pages

### List Page

This is where everyone can view what media you find interesting.

**Header Zone**

- Animated gradient background with floating "orb" elements (customizable via themes)
- Profile pic (overlaps header/content boundary), username, and join date
- Bookmark button (for other users to save this page)
- Share button
- "Edit List" button (visible only to the list owner)

**Tabs**

- A different tab for each media interest (movies, books, videos, etc.)
- Interests/tabs are created by the user

**Main List**

- Displays media as a grid
- Each card shows: image (if applicable), title, and category tags
- Clicking a card navigates to that media's review page
- Filter dropdown at top to filter by category tags (e.g., only show "horror" movies)
- Search bar to filter results by entering a term

---

### Media Review Page

This is where you can find what a user says about a particular piece of media.

**Layout Structure (top to bottom)**

1. **Main Navigation** (or Edit Toolbar when in edit mode)
2. **Back Link**
    - Positioned above the title bar, in plain content area
    - Text: "← Back to @username's list"
    - Links to the user's List Page
3. **Title Bar**
    - Contained gradient bar (not full-width) using the user's theme colors
    - Animated gradient background with floating orb elements
    - Subtle shimmer animation effect
    - Contains:
        - Title of the media (large, prominent)
        - Username with avatar (links to user's List Page)
4. **Media Representation**
    - Varies by type: video embed, Spotify embed, image, text snippet, etc.
    - Displayed in a rounded container
5. **Action Bar** (under the media)
    - Left side:
        - Reading time estimate (e.g., "1 min read" with clock icon)
        - Divider
        - Bookmark button
        - Share button
    - Right side:
        - "Edit" button (visible only to the owner, amber-tinted)
6. **Meta Information & Categories** (inline row)
    - Meta fields displayed as inline text: "Director: Denis Villeneuve · Year: 2017 · Runtime: 163 min"
    - Vertical divider
    - Category tags as small pills (e.g., Sci-Fi, Cyberpunk, Favorite)
    - Separated by a bottom border
7. **Description**
    - Markdown-rendered text of the user's thoughts
    - Styled with headings, lists, bold/italic text support
8. **Related Media**
    - Card section at bottom
    - List of related media the user has also written about
    - Each item shows: thumbnail/icon, title, arrow indicator
    - Clickable to navigate to that review

**Edit Mode Changes** When the owner clicks "Edit":

- Main nav is replaced with sticky amber Edit Toolbar
- Title becomes an editable input field
- Media embed section shows type selector dropdown and URL input
- Meta fields become inline editable pills with add/remove functionality
- Categories get removable X buttons and "Add" dropdown
- Description becomes a markdown textarea with formatting toolbar
- Related media items get remove buttons and "+ Add" option
- "Danger Zone" section appears at bottom with "Delete this review" option
- Floating "Unpublished changes" reminder appears in bottom-right

---

### Edit List Page (Edit Mode)

Rather than a separate page, the list page has an **edit mode** that overlays editing controls on the existing layout. This allows users to see exactly what they're changing in context.

#### Entering/Exiting Edit Mode

- "Edit List" button in the header (visible only to the list owner)
- Clicking it activates edit mode with an amber toolbar at the top
- "Exit Edit Mode" button in the toolbar to return to normal view

#### Edit Mode Toolbar

Located at the top of the page (sticky), contains:

- **Exit Edit Mode** button (left side)
- **View toggle** (grid/list icons) — switches between grid view and compact list view for easier reordering of large lists
- **Theme** button — opens the theme picker modal
- **Add Tab** button — creates a new media type/tab
- **Categories** button — opens the global category management modal

#### Tab Editing

In edit mode, each tab displays:

- Drag handle (left) for reordering tabs
- Tab name and count
- Delete button (right) — with confirmation if tab contains media

Users can also add a new tab via the "+ Add" button at the end of the tab bar.

#### Media Grid/List Editing

**Grid View (default)**

- Each card shows drag handle (top-left) and delete button (top-right)
- Cards are draggable for reordering
- Hover reveals a quick-edit pencil button (navigates to media review edit page)
- "+ Add Movie" placeholder card at the end

**List View (compact)**

- Horizontal rows with: drag handle, thumbnail, title, year, tags, edit button, delete button
- Much faster to scan and reorder when there are many items
- Same functionality as grid view, just denser layout

#### Category Management

Categories are **global** (used across all tabs/media types) and managed via a **modal dialog**, accessible from:

- The "Categories" button in the edit mode toolbar
- A "Manage categories" link (can be added elsewhere in the app as needed)

The modal allows users to:

- View all existing categories
- Create new categories
- Rename existing categories
- Delete categories (with warning if in use; removes tag from affected media)

**Note:** Applying categories to individual media items happens on the Media Review Page, not here. This keeps the list page focused on arrangement and the review page focused on content editing.

#### Saving & Publishing

- Changes made in edit mode are **auto-saved as a draft**
- A floating **"Publish Changes"** button appears in the bottom-right corner
- Exiting edit mode without publishing keeps changes as a draft (no modal interruption)
- A subtle toast/reminder appears: "Draft saved. Don't forget to publish!"
- When returning to the list page, an indicator shows if there are unpublished changes

#### Theme Customization

Users can customize the visual appearance of their list page via a **Theme picker**, accessible from the "Theme" button in the edit mode toolbar.

**Theme Structure (Header + Content Zones)**

The page is divided into two visual zones:

- **Header Zone (expressive)**: A hero area at the top with the user's profile picture, username, and join date. This is where personalization is most visible.
- **Content Zone (functional)**: The area below containing tabs, filters, and media cards. Kept more neutral to ensure readability.

**Header Zone Options**

Each theme includes an animated gradient background with floating "orb" elements that add depth and subtle movement. The profile avatar overlaps the header/content boundary, connecting the two zones visually.

**Preset Themes**

Users choose from curated preset themes rather than picking individual colors (prevents clashing combinations):

|Theme|Header Colors|Content Background|Accent Color|
|---|---|---|---|
|Ember|Warm stone/amber|Stone-950|Amber|
|Ocean|Cool slate/cyan|Slate-950|Cyan|
|Forest|Deep green/emerald|Neutral-950|Emerald|
|Violet|Rich purple|Zinc-950|Violet|
|Rose|Vibrant pink/red|Neutral-950|Rose|
|Minimal|Monochrome gray|Zinc-950|Gray|

**What Each Theme Controls**

- Animated header gradient and orb colors
- Content area background color
- Card backgrounds and borders
- Accent colors (tags, buttons, active tab indicators, publish button)
- Text colors (primary, secondary, muted)
- Profile avatar gradient

**Design Rationale**

- Header is the "personality" area—expressive but doesn't compete with content
- Content zone stays readable with dark, neutral backgrounds
- Preset themes prevent users from creating unreadable color combinations
- Animations are subtle (slow gradients, gentle floating) to avoid distraction

---

### Homepage

Generic landing page (to be designed).

---

### Edit Profile Page

A dedicated page for users to manage their account settings and view their bookmarks.

**Page Header**

- Title: "Edit Profile"
- Subtitle: "Manage your account and bookmarks"

**Profile Section**

Card containing profile information and editable fields:

- **Profile Header Row**
    - Large avatar (80px) with user's theme gradient
    - Edit button overlay on avatar (pencil icon) for changing profile picture
    - Username displayed as "@username"
    - Join date (e.g., "Joined March 2024")
    - Review count pill linking to user's List Page (e.g., "24 reviews" with arrow icon, styled with accent color)
- **Username Field**
    - Text input with current username
    - Helper text showing URL preview: "stuffiminto.com/@username"
- **Bio Field**
    - Textarea for personal description
    - Character counter (e.g., "84 / 160")
    - Placeholder: "Tell people a bit about yourself and your taste..."

**Bookmarks Section**

Card with tabbed interface for viewing saved content:

- **Tabs**
    - "Users" tab — bookmarked user profiles
    - "Reviews" tab — bookmarked media reviews
    - Each tab shows count badge (e.g., "3", "5")
    - Active tab highlighted with accent color
- **Bookmarked Users List**
    - Each row displays:
        - User avatar (with their theme gradient)
        - Username (e.g., "@moonlitcinema")
        - Review count (e.g., "42 reviews")
        - Arrow indicator (navigates to their List Page)
- **Bookmarked Reviews List**
    - Each row displays:
        - Media type icon or thumbnail
        - Media title (e.g., "Blade Runner 2049")
        - Author attribution (e.g., "by @moonlitcinema")
        - Arrow indicator (navigates to that review)
- **Empty State**
    - Shown when no bookmarks exist in a category
    - Muted icon and helper text

**Actions Row**

- **Log out button** (left side)
    - Ghost style with danger/red color
    - Includes logout icon
- **Save Changes button** (right side)
    - Primary style with accent gradient
    - Saves username and bio changes

---

### Explore Page

A simple discovery page for finding other users and their curated collections.

**Page Header**

- Title: "Explore" with bright green gradient background (pill-shaped highlight)
- Subtitle: "Discover people and their curated collections"

**Controls Row**

- **Search bar** (left, takes most of the width)
    - Placeholder: "Search users..."
    - Search icon on left
    - Green accent on focus state
- **Sort dropdown** (right)
    - Options: "Most popular", "Recently active", "Newest", "Most reviews"

**User List**

A flat, vertical list of user cards (no subsections or categories).

Each **User Card** displays:

- User avatar (48px) with their theme's gradient colors
- Username (e.g., "@astralcinema")
- Meta info: review count + join date (e.g., "87 reviews · Joined Dec 2024")
- Bio preview (2 lines max, truncated with ellipsis)
- Footer row:
    - Like/bookmark count with heart icon
    - Media type tags as small pills (e.g., "Movies", "Music") — styled with green accent

**Visual Style**

- Black background throughout the page
- Green used only for highlights: title background, focus states, active nav link, media type tags
- Cards have subtle dark backgrounds (`#0a0a0a`) with lighter borders on hover
- User avatars retain their individual theme gradients (Ember, Ocean, Forest, Violet, Rose) for visual variety

---

## Global Components

### Category Management Modal

A page-agnostic modal for managing category types:

- Accessible from edit mode toolbar, and potentially from media review edit page
- Create, rename, delete categories
- Categories are shared across all media types/tabs

---

## Design Decisions Summary

| Decision                                       | Choice                                                 | Rationale                                                            |
| ---------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| Edit list: separate page vs. edit mode         | Edit mode overlay                                      | Users see changes in context; more direct manipulation feel          |
| Edit media review: separate page vs. edit mode | Edit mode overlay                                      | Consistent with list page; user sees changes in context              |
| Reordering large lists                         | Grid + List view toggle                                | List view is compact and faster for 50+ items                        |
| Category management location                   | Global modal                                           | Categories are cross-cutting; keeps list page focused on arrangement |
| Applying tags to media                         | Media review page                                      | Keeps list page uncluttered; tags are content-level editing          |
| Save behavior                                  | Auto-save draft, explicit publish                      | Non-interruptive flow; users can experiment without going live       |
| Exit without publishing                        | Silent draft save + reminder toast                     | Respects user flow, but keeps them aware of unpublished changes      |
| Theme customization                            | Header zone + content zone                             | Header is expressive/personal; content stays readable                |
| Theme options                                  | Preset themes (not custom colors)                      | Prevents clashing combinations; ensures readability                  |
| Main nav behavior                              | Not sticky in view mode, sticky amber bar in edit mode | Clear visual distinction between viewing and editing states          |
| Media review title bar                         | Contained gradient bar (not full-width header)         | Adds theme personality without overwhelming; keeps focus on content  |
| Meta info & categories                         | Inline under video, not in sidebar cards               | Cleaner layout; all info flows vertically in single column           |
| Reading time                                   | Displayed in action bar under video                    | Gives reader context before they start; groups with other actions    |
| Back link placement                            | Above the title bar                                    | Clear escape route; doesn't compete with themed title area           |
| Edit Profile: bookmarks display                | Tabbed list (Users / Reviews)                          | Clean separation; counts visible at a glance                         |
| Edit Profile: review count                     | Clickable pill in profile header                       | Quick access to own list; reinforces content ownership               |
| Explore page: layout                           | Flat list with sort dropdown                           | Simple, scannable; no need for complex categorization                |
| Explore page: visual style                     | Black background, green highlights                     | Clean contrast; green accents draw attention to interactive elements |
