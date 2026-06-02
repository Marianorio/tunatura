"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { BrowserMultiFormatReader } from "@zxing/library"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, CameraOff, Loader2, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Product = { id: string; name: string; price: number; barcode: string | null }

export function BarcodeScanner({
  products,
  onScan,
}: {
  products: Product[]
  onScan: (product: Product) => void
}) {
  const [scanning, setScanning] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [notFound, setNotFound] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  const stopScanner = useCallback(() => {
    try {
      readerRef.current?.reset()
      readerRef.current = null
    } catch {}
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream | null
      stream?.getTracks().forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    setScanning(false)
    setStarting(false)
  }, [])

  useEffect(() => {
    return () => stopScanner()
  }, [stopScanner])

  async function startScanner() {
    setError(null)
    setStarting(true)

    const videoEl = videoRef.current
    if (!videoEl) {
      setError("Error interno")
      setStarting(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      videoEl.srcObject = stream
      await videoEl.play()

      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      await reader.decodeFromVideoElementContinuously(videoEl, (result) => {
        if (result) {
          const code = result.getText()
          const product = products.find((p) => p.barcode === code)
          if (product) {
            onScan(product)
            stopScanner()
          }
        }
      })

      setScanning(true)
      setStarting(false)
    } catch (e) {
      const msg =
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Permiso de cámara denegado"
          : "No se pudo acceder a la cámara"
      setError(msg)
      setStarting(false)
      setScanning(false)
      console.error(e)
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = manualCode.trim()
    if (!code) return

    const product = products.find((p) => p.barcode === code)
    if (product) {
      onScan(product)
      setManualCode("")
      setNotFound(false)
    } else {
      setNotFound(true)
    }
  }

  function toggle() {
    if (scanning || starting) {
      stopScanner()
    } else {
      startScanner()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={toggle}
          disabled={starting}
        >
          {starting ? (
            <Loader2 className="mr-2 size-3 animate-spin" />
          ) : scanning ? (
            <CameraOff className="mr-2 size-3" />
          ) : (
            <Camera className="mr-2 size-3" />
          )}
          {starting
            ? "Iniciando cámara..."
            : scanning
              ? "Detener escáner"
              : "Escanear"}
        </Button>
      </div>

      {scanning && (
        <div className="overflow-hidden rounded-lg border bg-black">
          <video
            ref={videoRef}
            className="min-h-[200px] w-full object-cover"
            playsInline
            muted
          />
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="O ingresá el código manualmente"
            value={manualCode}
            onChange={(e) => {
              setManualCode(e.target.value)
              setNotFound(false)
            }}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm" className="shrink-0">
          Buscar
        </Button>
      </form>

      {notFound && (
        <p className="text-xs text-destructive">No se encontró un producto con ese código</p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
