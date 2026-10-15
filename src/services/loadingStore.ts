// Tracks in-flight API requests so a global spinner can be shown.
let pending = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export function startRequest() {
  pending += 1
  emit()
}

export function endRequest() {
  pending = Math.max(0, pending - 1)
  emit()
}

export function subscribeToLoading(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function hasPendingRequests() {
  return pending > 0
}
