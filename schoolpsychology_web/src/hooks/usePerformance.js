import React, { useCallback, useRef, useEffect, useMemo } from 'react'

/**
 * Custom hook for performance optimizations
 */
export const usePerformance = () => {
  // Debounce function
  const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null)

    return useCallback(
      (...args) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args)
        }, delay)
      },
      [callback, delay]
    )
  }

  // Throttle function
  const useThrottle = (callback, delay) => {
    const lastCallRef = useRef(0)

    return useCallback(
      (...args) => {
        const now = Date.now()
        if (now - lastCallRef.current >= delay) {
          lastCallRef.current = now
          callback(...args)
        }
      },
      [callback, delay]
    )
  }

  // Smooth transition helper
  const useSmoothTransition = callback => {
    return useCallback(
      (...args) => {
        if (typeof React !== 'undefined' && React.startTransition) {
          React.startTransition(() => {
            callback(...args)
          })
        } else {
          // Fallback for older React versions
          requestAnimationFrame(() => {
            callback(...args)
          })
        }
      },
      [callback]
    )
  }

  // Memoized stable reference
  const useStableCallback = callback => {
    const callbackRef = useRef(callback)

    useEffect(() => {
      callbackRef.current = callback
    })

    return useCallback((...args) => {
      return callbackRef.current(...args)
    }, [])
  }

  // Virtual scrolling helper for large lists
  const useVirtualScroll = (items, itemHeight, containerHeight) => {
    return useMemo(() => {
      const visibleCount = Math.ceil(containerHeight / itemHeight)
      const buffer = Math.floor(visibleCount / 2)

      return {
        visibleCount: visibleCount + buffer * 2,
        startIndex: 0,
        endIndex: Math.min(visibleCount + buffer * 2, items.length),
        totalHeight: items.length * itemHeight,
      }
    }, [items.length, itemHeight, containerHeight])
  }

  return {
    useDebounce,
    useThrottle,
    useSmoothTransition,
    useStableCallback,
    useVirtualScroll,
  }
}

// Individual hooks for easier import
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null)

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

export const useThrottle = (callback, delay) => {
  const lastCallRef = useRef(0)

  return useCallback(
    (...args) => {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        callback(...args)
      }
    },
    [callback, delay]
  )
}

export const useSmoothTransition = callback => {
  return useCallback(
    (...args) => {
      if (typeof window !== 'undefined' && window.React?.startTransition) {
        window.React.startTransition(() => {
          callback(...args)
        })
      } else {
        // Fallback for older React versions or SSR
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => {
            callback(...args)
          })
        } else {
          callback(...args)
        }
      }
    },
    [callback]
  )
}
