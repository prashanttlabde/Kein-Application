'use client'

import { useState, useEffect, useCallback } from 'react'

const REEL_ID_KEY = 'current_reel_id'
const CART_URL_KEY = 'saved_cart_url'

export const useReelContext = () => {
  const [currentReelId, setCurrentReelId] = useState<string | null>(null)
  const [savedCartUrl, setSavedCartUrl] = useState<string | null>(null)

  // Load reel_id and cart URL from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedReelId = localStorage.getItem(REEL_ID_KEY)
      const storedCartUrl = localStorage.getItem(CART_URL_KEY)
      
      if (storedReelId) {
        setCurrentReelId(storedReelId)
      }
      
      if (storedCartUrl) {
        setSavedCartUrl(storedCartUrl)
      }
    }
  }, [])

  // Set reel_id and store in localStorage
  const setReelId = useCallback((reelId: string | null) => {
    setCurrentReelId(reelId)
    if (typeof window !== 'undefined') {
      if (reelId) {
        localStorage.setItem(REEL_ID_KEY, reelId)
        // Also save the cart URL with reel_id
        const cartUrl = `/cart?reel_id=${reelId}`
        localStorage.setItem(CART_URL_KEY, cartUrl)
        setSavedCartUrl(cartUrl)
      } else {
        localStorage.removeItem(REEL_ID_KEY)
        localStorage.removeItem(CART_URL_KEY)
        setSavedCartUrl(null)
      }
    }
  }, [])

  // Clear reel_id (useful when leaving reel context)
  const clearReelId = useCallback(() => {
    setReelId(null)
  }, [setReelId])

  // Save cart URL to localStorage
  const saveCartUrl = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_URL_KEY, url)
      setSavedCartUrl(url)
    }
  }, [])

  // Clear saved cart URL
  const clearCartUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_URL_KEY)
      setSavedCartUrl(null)
    }
  }, [])

  // Get cart URL with reel_id if available, or use saved URL
  const getCartUrl = useCallback(() => {
    if (currentReelId) {
      return `/cart?reel_id=${currentReelId}`
    }
    return savedCartUrl || '/cart'
  }, [currentReelId, savedCartUrl])

  return {
    currentReelId,
    setReelId,
    clearReelId,
    getCartUrl,
    saveCartUrl,
    clearCartUrl,
    savedCartUrl
  }
}

