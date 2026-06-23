import { useCallback, useEffect, useRef, useState } from 'react'

type Permission = 'unknown' | 'granted' | 'denied'

interface DeviceMotionEventStatic {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

/**
 * Shake-to-trigger hook. Counts sharp accelerometer jolts; three within a short
 * window fire `onShake`. iOS 13+ requires a permission request from a user
 * gesture, exposed here as `enable()`.
 */
export function useShake(onShake: () => void) {
  const motionSupported = typeof window !== 'undefined' && 'DeviceMotionEvent' in window
  const needsPermission =
    motionSupported &&
    typeof (window.DeviceMotionEvent as unknown as DeviceMotionEventStatic).requestPermission === 'function'

  const [enabled, setEnabled] = useState(false)
  const [permission, setPermission] = useState<Permission>('unknown')

  const onShakeRef = useRef(onShake)
  onShakeRef.current = onShake

  const last = useRef({ x: 0, y: 0, z: 0, t: 0 })
  const jolts = useRef<number[]>([])

  const handler = useCallback((e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity
    if (!a || a.x == null || a.y == null || a.z == null) return
    const now = Date.now()
    const l = last.current
    if (l.t === 0) {
      last.current = { x: a.x, y: a.y, z: a.z, t: now }
      return
    }
    const delta = Math.abs(a.x - l.x) + Math.abs(a.y - l.y) + Math.abs(a.z - l.z)
    last.current = { x: a.x, y: a.y, z: a.z, t: now }

    const THRESHOLD = 16 // jolt strength
    const MIN_GAP = 120 // ms between counted jolts
    const WINDOW = 1600 // ms to collect 3 jolts
    if (delta > THRESHOLD) {
      const arr = jolts.current
      if (arr.length === 0 || now - arr[arr.length - 1] > MIN_GAP) {
        arr.push(now)
        // keep only jolts inside the rolling window
        while (arr.length && now - arr[0] > WINDOW) arr.shift()
        if (arr.length >= 3) {
          jolts.current = []
          onShakeRef.current()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    window.addEventListener('devicemotion', handler)
    return () => window.removeEventListener('devicemotion', handler)
  }, [enabled, handler])

  const enable = useCallback(async () => {
    if (!motionSupported) return
    if (needsPermission) {
      try {
        const res = await (
          window.DeviceMotionEvent as unknown as DeviceMotionEventStatic
        ).requestPermission!()
        setPermission(res === 'granted' ? 'granted' : 'denied')
        if (res !== 'granted') return
      } catch {
        setPermission('denied')
        return
      }
    } else {
      setPermission('granted')
    }
    last.current = { x: 0, y: 0, z: 0, t: 0 }
    jolts.current = []
    setEnabled(true)
  }, [motionSupported, needsPermission])

  const disable = useCallback(() => setEnabled(false), [])

  return { motionSupported, needsPermission, enabled, permission, enable, disable }
}
