"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type FontSize = "standard" | "large" | "xlarge"

const FontSizeContext = createContext<{
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}>({ fontSize: "standard", setFontSize: () => {} })

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>("standard")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("fontSize") as FontSize | null
    if (stored && ["standard", "large", "xlarge"].includes(stored)) {
      setFontSize(stored)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.remove("font-size-large", "font-size-xlarge")
    if (fontSize !== "standard") {
      document.documentElement.classList.add(`font-size-${fontSize}`)
    }
    localStorage.setItem("fontSize", fontSize)
  }, [fontSize, mounted])

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export const useFontSize = () => useContext(FontSizeContext)
