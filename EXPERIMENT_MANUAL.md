# SocialPulse Redux: Experiments 1.2.1 & 1.2.2 Comprehensive Lab Manual

**Course:** Full Stack Development (Frontend State Architecture & Performance Optimization)  
**Author:** Shivam Ray (`shivamray603@gmail.com` / `shivam603`)  
**Topic:** Centralized State Management using Redux Toolkit & Performance Optimization using Memoized Selectors (Reselect)

---

## 1. Experiment Overview

### Combined Aim
To design, implement, and optimize a centralized state management system using **Redux Toolkit** and **Reselect** to handle normalized application data (posts, publishing channels, drafts, authentication, and UI state) while maximizing frontend performance through memoized selectors and render minimization.

### Objectives
1. **Global State Management (CO1 - BT1):** Understand and implement a centralized single source of truth using Redux Toolkit's `configureStore`.
2. **State Normalization (CO2 - BT2):** Design a relational, normalized state structure (`ids` array and `entities` dictionary) using `createEntityAdapter` to achieve \(O(1)\) lookups and eliminate nested data redundancy.
3. **Async Data Flows (CO3 - BT3):** Manage asynchronous API operations (CRUD for posts, JWT authentication, administrative actions) with `createAsyncThunk`.
4. **Derived State & Memoization (CO4 - BT4):** Implement memoized selectors using `createSelector` to compute filtered, sorted, grouped, and calendar-matrix data without redundant re-computations.
5. **Render Minimization (CO5 - BT5):** Utilize `React.memo`, `useCallback`, and atomic slice subscriptions to isolate component re-renders.
6. **Performance Telemetry & Verification (CO6 - BT6):** Profile and evaluate selector cache hit rates, action logging, and component re-render counters via the built-in **Redux State Inspector**.

---

## 2. Theoretical Foundations

### 2.1 Classical Redux vs. Redux Toolkit (RTK)

| Aspect | Classical Redux | Redux Toolkit (RTK) |
| :--- | :--- | :--- |
| **Boilerplate** | High: requires separate action types, action creators, and reducers. | Low: `createSlice` automatically generates action types and action creators. |
| **Immutability** | Manual copying with spread operator (`...state`). Risk of accidental state mutation. | Integrated **Immer.js**: enables direct mutable syntax while producing safe immutable copies. |
| **Store Setup** | Complex configuration with `createStore`, `combineReducers`, and manual middleware wiring. | Simplified with `configureStore` with out-of-the-box Thunk and DevTools integration. |
| **Async Operations** | Manual action triplets (REQUEST / SUCCESS / FAILURE) and thunk setup. | `createAsyncThunk` generates `pending`, `fulfilled`, and `rejected` action types automatically. |

---

### 2.2 Normalized State vs. Nested/Array State

#### Nested/Array State (Naive Pattern)
```javascript
// Non-normalized: Array of nested objects
{
  posts: [
    { id: "p1", title: "Post 1", author: { id: "u1", name: "Shivam" } },
    { id: "p2", title: "Post 2", author: { id: "u1", name: "Shivam" } }
  ]
}
```
*Disadvantages:*
- Updating author name requires iterating over all posts in \(O(N)\) time.
- Deleting or editing a post requires deep array cloning.
- Components re-render whenever the array reference changes.

#### Normalized State (RTK `createEntityAdapter`)
```javascript
// Normalized: Tables with primary keys
{
  posts: {
    ids: ["p1", "p2"],
    entities: {
      "p1": { id: "p1", title: "Post 1", authorId: "u1" },
      "p2": { id: "p2", title: "Post 2", authorId: "u1" }
    }
  }
}
```
*Advantages:*
- \(O(1)\) lookup time: `entities[id]`.
- Single source of truth with zero duplication.
- Editing `p1` changes only `entities["p1"]`, leaving unaffected items untouched.

---

### 2.3 Reselect & Memoized Selectors (EXP 1.2.2)

A selector is a function that extracts or derives data from the global Redux store:
$$\text{Selector}: \text{State} \rightarrow \text{DerivedData}$$

#### Why Memoization is Essential:
1. **Unmemoized selector:** Returns a new array/object reference every time `useSelector` executes, triggering unnecessary re-renders in React even if the data content is identical.
2. **Memoized selector (`createSelector`):**
   - Tracks input selectors: `[inputSelector1, inputSelector2, ...]`.
   - Computes derived output only when reference equality (`===`) of input selector results fails.
   - If inputs have not changed, it returns the cached result instantaneously in \(O(1)\).

```
┌─────────────────────────────────────────────────────────────┐
│                       Redux Store                           │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
    selectAllPosts (ids/entities)       selectFilters (search/platform)
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
               ┌───────────────────────────────┐
               │  createSelector               │
               │  [Input Selectors Changed?]   │
               └───────────────┬───────────────┘
                     NO ───────┼─────── YES
                     │                 │
                     ▼                 ▼
             Return Cached Data   Recompute Output & Update Cache
                     │                 │
                     └────────┬────────┘
                              ▼
                 selectFilteredPosts Result
                              ▼
                      React Component (PostList)
```

---

## 3. Redux Store Slices Architecture

```
src/store/
├── index.js                     (Root configureStore)
├── slices/
│   ├── postsSlice.js            (Normalized entity adapter & async thunks)
│   ├── platformsSlice.js        (Channel constraints & metadata)
│   ├── draftsSlice.js           (Active draft buffer & local snapshots)
│   ├── filtersSlice.js          (Search query, platform, status, sort)
│   ├── authSlice.js             (JWT session, login/register thunks)
│   └── uiSlice.js               (Active tabs, calendar date, profiler stats)
├── selectors/
│   └── postSelectors.js         (Memoized Reselect selectors & aggregations)
└── middleware/
    └── actionLoggerMiddleware.js (Real-time action stream interceptor)
```

### Key Slice Responsibilities:
1. **`postsSlice`:** Maintains normalized posts `{ ids, entities }` using `createEntityAdapter`. Exports async thunks `fetchPosts`, `createPost`, `updatePost`, `deletePost`, and `togglePostStatus`.
2. **`platformsSlice`:** Stores supported social media channels (Instagram, Facebook, X, Reddit, Quora, LinkedIn, YouTube) with character limits and validation rules.
3. **`draftsSlice`:** Holds current in-progress composition state to prevent premature writes to the posts collection, with local snapshot restore history.
4. **`filtersSlice`:** Manages search keyword, selected platform filter, post status filter (all, draft, scheduled), and sort order.
5. **`postSelectors`:** Contains memoized selectors:
   - `selectFilteredPosts`: Multi-criteria search and filter.
   - `selectGroupedPostsByPlatform`: Channel aggregation.
   - `selectPostStats`: Analytical summary, average word counts, top tags.
   - `selectCalendarEventsByMonth`: 42-day calendar matrix for active month.

---

## 4. Step-by-Step Procedure & Execution

### Step 1: Install Dependencies & Build
```powershell
npm install
npm run build
```

### Step 2: Start the Centralized Server
```powershell
npm start
```
Open **`http://localhost:3000`** in your browser.

### Step 3: Verify Experiment 1.2.1 (Redux Toolkit & Normalization)
1. **Authenticate:** Register a new user or sign in with default administrator (`admin@contentdeck.local` / `Admin@12345`).
2. **Create Posts:** In the **Composer** tab, create posts for different channels (Instagram, X, LinkedIn) with tags and scheduling dates.
3. **Open Redux State Inspector:** Switch to the **Redux State Inspector** tab.
   - Verify that `posts.ids` contains the array of post IDs.
   - Verify that `posts.entities` contains the dictionary indexed by ID.
   - Observe the **Live Dispatched Action Log** displaying `posts/createPost/fulfilled` and `posts/fetchPosts/fulfilled`.

### Step 4: Verify Experiment 1.2.2 (Memoized Selectors & Performance)
1. **Filter Posts:** In the **Board** tab, type a search keyword and toggle channel chips.
   - Observe instantaneous filtering via `selectFilteredPosts`.
2. **Inspect Component Re-renders:**
   - In the **Redux State Inspector**, review the **Component Re-render Counts** table.
   - Edit a single post's title in Composer.
   - Observe that only the edited `PostCard` re-renders, while unaffected post cards maintain their render counts due to `React.memo` and normalized selector mapping.
3. **Derived Metrics & Calendar:**
   - Open **Analytics & Derived Metrics** to view derived channel distributions and hashtag frequencies calculated via `selectPostStats`.
   - Open **Calendar** to view scheduled posts mapped into a 42-cell matrix via `selectCalendarEventsByMonth`.

---

## 5. Lab Viva / Review Questions & Answers

### Q1: What is the main problem solved by state normalization?
**Ans:** Non-normalized nested state results in data duplication, complex update logic (\(O(N)\) search-and-replace), and cascading re-renders across the component tree. Normalization flattens state into relational tables (`ids` array and `entities` dictionary), enabling \(O(1)\) lookups and isolated updates.

### Q2: How does `createSelector` prevent unnecessary computations?
**Ans:** `createSelector` uses memoization. It records the output of its input selectors and compares them on subsequent calls using reference equality (`===`). If none of the input values have changed, it skips the expensive calculation function and returns the cached result directly.

### Q3: What is the relationship between `React.memo` and Redux normalized state?
**Ans:** `React.memo` performs a shallow comparison of component props. When state is normalized, updating one post only produces a new object reference for `entities[updatedId]`. All other `entities[otherId]` retain their exact memory references. Therefore, `React.memo` successfully skips re-rendering all unaffected list items.

### Q4: What does `createAsyncThunk` do under the hood?
**Ans:** `createAsyncThunk` accepts an action type string and an asynchronous payload creator callback. It automatically generates and dispatches `pending`, `fulfilled`, and `rejected` action types based on the promise lifecycle, passing results to slice `extraReducers`.

---

## 6. Conclusion
By integrating **Redux Toolkit** (`createEntityAdapter`, `createSlice`, `createAsyncThunk`) and **Reselect** (`createSelector`) with **React.memo**, SocialPulse achieves a production-grade, scalable frontend state architecture. State access is optimized with \(O(1)\) lookups, derived data is calculated with zero redundant iterations, and UI rendering performance is strictly minimized across large datasets.
