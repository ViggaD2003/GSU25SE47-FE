import React, { useState, useEffect } from 'react'
import { useAutoTranslation } from '../../hooks/useAutoTranslation'

const AutoTranslatedText = ({
  text,
  translationKey,
  fallback = text,
  className = '',
  loadingComponent = null,
  onTranslationComplete = null,
}) => {
  const { autoTranslate } = useAutoTranslation()
  const [translatedText, setTranslatedText] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const translateText = async () => {
      setIsLoading(true)
      try {
        const result = await autoTranslate(translationKey || text, fallback)
        setTranslatedText(result)
        onTranslationComplete?.(result)
      } catch (error) {
        console.error('Translation failed:', error)
        setTranslatedText(fallback)
      } finally {
        setIsLoading(false)
      }
    }

    translateText()
  }, [text, translationKey, fallback, autoTranslate, onTranslationComplete])

  if (isLoading && loadingComponent) {
    return loadingComponent
  }

  return <span className={className}>{translatedText || fallback}</span>
}

export default AutoTranslatedText
