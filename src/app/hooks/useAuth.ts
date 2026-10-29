"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface ExtendedUser {
  uid: string
  email: string | null
  displayName: string | null
  role: "admin" | "seller" | "user"
  referralCode?: string   // ← este es el que necesitamos
  [key: string]: unknown  // por si hay más campos
}

export default function useAuth() {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()

            console.log("[useAuth] Datos del usuario desde Firestore:", userData) // ← ESTE LOG ES CLAVE

            setUser({
              ...firebaseUser,
              role: userData.role || "user",
              referralCode: userData.referralCode || userData.codigo || userData.refCode || undefined,
              // Prueba también con otros nombres por si acaso
            })
          } else {
            setUser({
              ...firebaseUser,
              role: "user",
            })
          }
        } catch (error) {
          console.error("Error cargando usuario:", error)
          setUser({
            ...firebaseUser,
            role: "user",
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}