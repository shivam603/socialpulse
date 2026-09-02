# SocialPulse (Experiments 1.2.1 & 1.2.2)

> A modern content composition, scheduling, and analytics workspace powered by **React**, **Redux Toolkit (RTK)**, and **Reselect** memoized state architecture.

SocialPulse brings the daily publishing workflow into one centralized, high-performance web application. Create drafts with live platform character counters, schedule content across channels (Instagram, Facebook, X, Reddit, Quora, LinkedIn, YouTube), inspect normalized state collections, observe memoized selector caching, and manage workspace governance.

[View the repository](https://github.com/shivam603/socialpulse) · [Report an issue](https://github.com/shivam603/socialpulse/issues)

---

## 🎯 Combined Lab Experiments

- **Experiment 1.2.1 (Centralized State Management with Redux Toolkit):**
  - Normalized state architecture via `createEntityAdapter` (`ids` array and `entities` dictionary for $O(1)$ lookups).
  - Domain slices for `posts`, `platforms`, `drafts`, `filters`, `auth`, and `ui`.
  - Async data operations with `createAsyncThunk`.
- **Experiment 1.2.2 (Memoized Selectors & Render Optimization):**
  - Reselect `createSelector` for derived filtered lists, platform aggregations, and calendar date mapping.
  - Component optimization using `React.memo`, `useCallback`, and isolated slice subscriptions.
  - Interactive **Redux State Inspector & Performance Profiler** displaying live normalized state trees, selector cache analytics, and component re-render counters.

---

## 🚀 Product Highlights

| Feature Area | Implementation Details |
| :--- | :--- |
| **Composer** | Connected to `draftsSlice` and `platformsSlice` with live character counters, media inputs, and snapshot restore history. |
| **Post Board** | Memoized multi-criteria filtering (`selectFilteredPosts`) by keyword, platform, status (draft/scheduled), and sorting. |
| **Publishing Calendar** | 42-day monthly calendar matrix generated via `selectCalendarEventsByMonth`. |
| **Analytics & Metrics** | Derived summaries (`selectPostStats` & `selectGroupedPostsByPlatform`) for channel breakdown, scheduled ratios, and hashtag counts. |
| **Redux State Inspector** | Live evaluation visualizer showing normalized store tree (`ids`/`entities`), dispatched action streams, and component render telemetry. |
| **Admin Panel** | Workspace account governance and post moderation. |

---

## 📦 Getting Started

### Requirements
- Node.js 18 or newer
- npm

### Install and Run

```powershell
# 1. Install dependencies
npm install

# 2. Build the React + Redux Toolkit bundle
npm run build

# 3. Start the Express server
npm start
```

Open **`http://localhost:3000`** in your browser.

*(For active frontend development with hot-reload, run `npm run dev`)*

---

## 🏗️ State Architecture & Slices

```text
src/
├── store/
│   ├── index.js                    # configureStore with action logger middleware
│   ├── slices/
│   │   ├── postsSlice.js           # createEntityAdapter normalized posts & async thunks
│   │   ├── platformsSlice.js       # Social platform definitions & character limits
│   │   ├── draftsSlice.js          # Unsaved draft buffer & snapshot caching
│   │   ├── filtersSlice.js         # Search query, channel filters, status, sort
│   │   ├── authSlice.js            # Authentication state & JWT thunks
│   │   └── uiSlice.js              # View navigation, calendar date, profiler stats
│   ├── selectors/
│   │   └── postSelectors.js        # Reselect createSelector memoized derivations
│   └── middleware/
│       └── actionLoggerMiddleware.js # Intercepts and logs actions to inspector
├── components/
│   ├── Navbar.jsx                  # Header with user role, profiler toggle, view tabs
│   ├── Composer.jsx                # Post composition with character limit enforcement
│   ├── PostCard.jsx                # React.memo optimized individual card with render counter
│   ├── PostList.jsx                # Filter toolbar and memoized post list
│   ├── CalendarView.jsx            # Monthly calendar grid with scheduled posts
│   ├── AnalyticsView.jsx           # Derived channel breakdown and top tags
│   ├── StateInspector.jsx          # Live normalized state tree & re-render telemetry
│   └── AdminPanel.jsx              # User role management and moderation
├── App.jsx                         # Main layout controller
├── main.jsx                        # Entrypoint with Redux Provider
└── index.css                       # Modern SocialPulse styling
```

---

## 📚 Experiment Manual

For detailed theory, state normalization diagrams, Reselect memoization graphs, and viva/exam question answers, see [EXPERIMENT_MANUAL.md](EXPERIMENT_MANUAL.md).

---

## 👤 Author

**Shivam Ray**  
[GitHub](https://github.com/shivam603) · [Email](mailto:shivamray603@gmail.com)
