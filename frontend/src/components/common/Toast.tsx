import { useState, useEffect } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

let toastId = 0
let toastQueue: Toast[] = []
let setToasts: ((toasts: Toast[]) => void) | null = null

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const id = `toast-${toastId++}`
  const toast: Toast = { id, message, type }
  toastQueue.push(toast)
  if (setToasts) setToasts([...toastQueue])
}

export default function Toast() {
  const [toasts, setToastsState] = useState<Toast[]>([])

  useEffect(() => {
    setToasts = (newToasts: Toast[]) => setToastsState(newToasts)
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return

    const timer = setTimeout(() => {
      toastQueue.shift()
      setToastsState([...toastQueue])
    }, 2400)

    return () => clearTimeout(timer)
  }, [toasts])

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${
            toast.type === 'success'
              ? 'bg-success'
              : toast.type === 'error'
              ? 'bg-error'
              : 'bg-sidebar'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
