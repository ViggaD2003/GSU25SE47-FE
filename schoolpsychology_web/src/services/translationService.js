import axios from 'axios'

// DeepL API service
class TranslationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_DEEPL_API_KEY
    this.isPro = import.meta.env.VITE_DEEPL_IS_PRO
    this.baseURL = this.isPro
      ? '/api-deepl-pro/v2/translate'
      : '/api-deepl/v2/translate'
  }

  // Map ngôn ngữ từ i18next sang DeepL format
  getLanguageCode(language) {
    const languageMap = {
      vi: 'VI',
      en: 'EN',
    }
    return languageMap[language] || language.toUpperCase()
  }

  async translateText(text, targetLanguage, sourceLanguage = 'EN') {
    try {
      if (!this.apiKey) {
        console.warn('DeepL API key not found')
        return text
      }

      const targetLang = this.getLanguageCode(targetLanguage)
      const sourceLang = sourceLanguage
        ? this.getLanguageCode(sourceLanguage)
        : null

      const requestData = {
        text: [text],
        target_lang: targetLang,
      }

      // Chỉ thêm source_lang nếu được chỉ định
      if (sourceLang) {
        requestData.source_lang = sourceLang
      }

      const response = await axios.post(this.baseURL, requestData, {
        headers: {
          Authorization: `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      return response.data.translations[0].text
    } catch (error) {
      console.error(
        'DeepL translation error:',
        error.response?.data || error.message
      )
      return text
    }
  }

  async translateBatch(texts, targetLanguage, sourceLanguage = 'EN') {
    try {
      if (!this.apiKey) {
        console.warn('DeepL API key not found')
        return texts
      }

      const targetLang = this.getLanguageCode(targetLanguage)
      const sourceLang = sourceLanguage
        ? this.getLanguageCode(sourceLanguage)
        : null

      const requestData = {
        text: texts,
        target_lang: targetLang,
      }

      // Chỉ thêm source_lang nếu được chỉ định
      if (sourceLang) {
        requestData.source_lang = sourceLang
      }

      const response = await axios.post(this.baseURL, requestData, {
        headers: {
          Authorization: `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      return response.data.translations.map(t => t.text)
    } catch (error) {
      console.error(
        'DeepL batch translation error:',
        error.response?.data || error.message
      )
      return texts
    }
  }

  // Kiểm tra trạng thái API key
  async checkApiStatus() {
    try {
      if (!this.apiKey) {
        return { valid: false, message: 'API key not found' }
      }

      const usageUrl = this.isPro
        ? '/api-deepl-pro/v2/usage'
        : '/api-deepl/v2/usage'

      const response = await axios.get(usageUrl, {
        headers: {
          Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        },
      })

      return {
        valid: true,
        usage: response.data,
        isPro: this.isPro,
      }
    } catch (error) {
      return {
        valid: false,
        message: error.response?.data?.message || error.message,
      }
    }
  }
}

export default new TranslationService()
