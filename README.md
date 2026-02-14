
# 📘 README.md

````markdown
# Smart Bookmark App

A full-stack bookmark manager built with Next.js (App Router), Supabase, and Tailwind CSS.

## 🚀 Live Demo

Live URL: https://smart-bookmark-app-two-rho.vercel.app/
GitHub Repo: https://github.com/priyanshu91131/smart-bookmark-app

---

## 📌 Features

- Google OAuth authentication (no email/password)
- Add bookmarks (URL + title)
- Delete bookmarks
- Private bookmarks per user (Row Level Security enabled)
- Real-time updates across multiple tabs
- Deployed on Vercel

---

## 🛠 Tech Stack

- **Next.js (App Router)**
- **Supabase**
  - Authentication (Google OAuth)
  - PostgreSQL Database
  - Realtime
- **Tailwind CSS**
- **Vercel** for deployment

---

## 🧠 Architecture Overview

- Supabase handles authentication and database.
- Bookmarks table includes a `user_id` column tied to `auth.uid()`.
- Row Level Security (RLS) ensures users can only access their own bookmarks.
- Supabase Realtime listens for `INSERT` and `DELETE` events.
- The frontend subscribes to database changes and updates UI instantly.

---

## 🔐 Database Security (RLS Policies)

RLS is enabled on the `bookmarks` table.

Policies implemented:

- SELECT → Only rows where `user_id = auth.uid()`
- INSERT → Only allow if `user_id = auth.uid()`
- DELETE → Only allow if `user_id = auth.uid()`

This ensures bookmarks are fully private per user.

---

## ⚠️ Problems I Faced & How I Solved Them

### 1️⃣ Issue: Users Could Create Empty Bookmarks

**Problem:**  
Bookmarks could be created without a URL or title.

**Solution:**
- Added frontend validation.
- Added a database-level `CHECK` constraint to prevent empty values.
- This ensures invalid data cannot enter the database even if frontend validation fails.

---

### 2️⃣ Issue: DELETE Did Not Trigger Realtime Updates

**Problem:**  
When deleting a bookmark in one tab, it did not disappear in another tab unless the page was refreshed.

INSERT events were working, but DELETE events were not firing.

**Root Cause:**  
The `bookmarks` table was not correctly configured in the `supabase_realtime` publication for DELETE operations.

---

### ✅ Debugging Steps

**Step 1 → Open SQL Editor**

Supabase Dashboard → SQL Editor → New Query

**Step 2 → Check Publication Tables**

```sql
select *
from pg_publication_tables
where pubname = 'supabase_realtime';
````

If `bookmarks` was missing or incorrectly registered, DELETE events would not be broadcast.

**Step 3 → Force Fix (Re-add Table to Publication)**

```sql
alter publication supabase_realtime drop table public.bookmarks;
alter publication supabase_realtime add table public.bookmarks;
```

After re-adding the table, DELETE events started broadcasting correctly.

Result:

* Deleting in one tab instantly removes it in the other.
* Realtime sync works as expected.

---


## 🧪 How To Run Locally

1. Clone repo
2. Install dependencies:

```bash
npm install
```

3. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. Run:

```bash
npm run dev
```

---

## ⏳ Time Spent

Completed within the 72-hour time limit.

---

## 💡 What I Learned

* How PostgreSQL publications control realtime behavior
* How Supabase Realtime works under the hood
* Importance of database-level validation
* Proper OAuth redirect configuration for production
* Implementing Row Level Security correctly

---

## 📎 Final Notes

The application supports:

* Multiple users
* Private data isolation
* Real-time synchronization
* Production deployment

The app has been tested using multiple accounts and multiple browser tabs to verify correct behavior.

