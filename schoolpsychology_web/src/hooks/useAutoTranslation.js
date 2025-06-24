import { useTranslation } from 'react-i18next'
import { useCallback, useMemo } from 'react'
import translationService from '../services/translationService'

export const useAutoTranslation = () => {
  const { t, i18n } = useTranslation()

  // Cache để lưu các bản dịch đã được dịch tự động
  const translationCache = useMemo(() => new Map(), [])

  const autoTranslate = useCallback(
    async (key, fallbackText = key) => {
      const currentLang = i18n.language

      // Kiểm tra cache trước
      const cacheKey = `${key}_${currentLang}`
      if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)
      }

      // Thử lấy từ i18next trước
      const i18nResult = t(key, { returnObjects: false })

      // Nếu kết quả khác key gốc, có nghĩa là đã có bản dịch
      if (i18nResult !== key) {
        return i18nResult
      }

      // Nếu không có bản dịch, sử dụng auto translation
      try {
        const translatedText = await translationService.translateText(
          fallbackText,
          currentLang,
          'en'
        )

        // Lưu vào cache
        translationCache.set(cacheKey, translatedText)

        return translatedText
      } catch (error) {
        console.error('Auto translation failed:', error)
        return fallbackText
      }
    },
    [t, i18n.language, translationCache]
  )

  const autoTranslateSync = useCallback(
    (key, fallbackText = key) => {
      const currentLang = i18n.language

      // Kiểm tra cache trước
      const cacheKey = `${key}_${currentLang}`
      if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)
      }

      // Thử lấy từ i18next trước
      const i18nResult = t(key, { returnObjects: false })

      // Nếu kết quả khác key gốc, có nghĩa là đã có bản dịch
      if (i18nResult !== key) {
        return i18nResult
      }

      // Trả về fallback text nếu không có cache
      return fallbackText
    },
    [t, i18n.language, translationCache]
  )

  return {
    t: autoTranslateSync, // Synchronous version
    autoTranslate, // Asynchronous version
    clearCache: () => translationCache.clear(),
  }
}
