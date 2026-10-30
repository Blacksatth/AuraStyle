"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/client"
import type { AppUser, UserRole } from "@/types/user"

function toAppUser(
  firebaseUser: {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
  },
  data?: Record<string, unknown>,
): AppUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    role: (data?.role as UserRole | undefined) ?? "user",
    referralCode:
      (data?.referralCode as string | undefined) ??
      (data?.codigo as string | undefined) ??
      (data?.refCode as string | undefined),
  }
}

export default function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const snapshot = await getDoc(doc(db, "users", firebaseUser.uid))
        setUser(toAppUser(firebaseUser, snapshot.data()))
      } catch (error) {
        console.error("Error cargando usuario:", error)
        setUser(toAppUser(firebaseUser))
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
