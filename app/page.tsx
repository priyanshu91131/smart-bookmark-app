"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [bookmarks, setBookmarks] = useState<any[]>([])

  // ✅ PART 10 — CHECK LOGGED IN USER
useEffect(() => {
  let channel: any

  const init = async () => {
    const { data } = await supabase.auth.getUser()
    const currentUser = data.user
    setUser(currentUser)

    if (!currentUser) return

    await fetchBookmarks(currentUser.id)

    channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log("Realtime event:", payload)
          fetchBookmarks(currentUser.id)
        }
      )
      .subscribe()
  }

  init()

  return () => {
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
}, [])



  // Fetch bookmarks
  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }

  // Login
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
    redirectTo: `${location.origin}/auth/callback`,
  },
    })
  }

  // Logout
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // ✅ PART 11 — INSERT BOOKMARK
const addBookmark = async () => {
  if (!user) return

  if (!title.trim() || !url.trim()) {
    alert("Title and URL are required")
    return
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    alert("URL must start with http:// or https://")
    return
  }

  await supabase.from("bookmarks").insert({
    title: title.trim(),
    url: url.trim(),
    user_id: user.id,
  })

  setTitle("")
  setUrl("")
  fetchBookmarks(user.id)
}


  // Delete
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
    fetchBookmarks(user.id)
  }

  // ----------------------------
  // UI
  // ----------------------------

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button
          onClick={login}
          className="bg-black text-white px-6 py-3 rounded"
        >
          Login with Google
        </button>
      </div>
    )
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">My Bookmarks</h1>
        <button onClick={logout} className="text-red-500">
          Logout
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 flex-1"
        />
        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 flex-1"
        />
        <button
          onClick={addBookmark}
          className="bg-black text-white px-4"
        >
          Add
        </button>
      </div>

      <ul>
        {bookmarks.map((b) => (
          <li
            key={b.id}
            className="flex justify-between border-b py-2"
          >
            <a href={b.url} target="_blank">
              {b.title}
            </a>
            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
