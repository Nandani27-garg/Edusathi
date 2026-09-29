/**
 * EduSaarthi - Centralized Global Language Manager
 * 
 * Strict Single Global Language State:
 * - Single source of truth: localStorage['edusaarthi_language']
 * - Default on first visit: 'en' (English)
 * - User manual selection has absolute priority:
 *   NEVER automatically change based on browser language, URL, page,
 *   AI response, microphone language, device, geolocation, or page reload.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'edusaarthi_language';
  const DEFAULT_LANG = 'en';

  const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', name: 'English', speechCode: 'en-IN' },
    { code: 'hi', label: 'हिन्दी', name: 'Hindi', speechCode: 'hi-IN' },
    { code: 'bn', label: 'বাংলা', name: 'Bengali', speechCode: 'bn-IN' },
    { code: 'or', label: 'ଓଡ଼ିଆ', name: 'Odia', speechCode: 'or-IN' },
    { code: 'te', label: 'తెలుగు', name: 'Telugu', speechCode: 'te-IN' },
    { code: 'mr', label: 'मराठी', name: 'Marathi', speechCode: 'mr-IN' },
    { code: 'gu', label: 'ગુજરાતી', name: 'Gujarati', speechCode: 'gu-IN' },
    { code: 'ta', label: 'தமிழ்', name: 'Tamil', speechCode: 'ta-IN' },
    { code: 'sat', label: 'ᱥᱟᱱᱛᱟᱲᱤ', name: 'Santhali', speechCode: 'hi-IN' }
  ];

  const SPEECH_LOCALE_MAP = {
    en: 'en-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    or: 'or-IN',
    te: 'te-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    ta: 'ta-IN',
    sat: 'hi-IN'
  };

  const LanguageManager = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_LANG: DEFAULT_LANG,
    SUPPORTED_LANGUAGES: SUPPORTED_LANGUAGES,

    /**
     * Get the single global language state.
     * Returns saved localStorage preference or default 'en'.
     */
    getCurrentLanguage: function () {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
          return saved;
        }
      } catch (e) {
        console.warn('LanguageManager: localStorage read error', e);
      }
      return DEFAULT_LANG;
    },

    // Legacy getter alias
    get: function () {
      return this.getCurrentLanguage();
    },

    /**
     * Set the global language state.
     * Manual user selection has absolute priority.
     */
    setLanguage: function (lang, reload = true) {
      if (!lang) return;
      const isValid = SUPPORTED_LANGUAGES.some(l => l.code === lang);
      const targetLang = isValid ? lang : DEFAULT_LANG;

      try {
        localStorage.setItem(STORAGE_KEY, targetLang);
      } catch (e) {
        console.warn('LanguageManager: localStorage write error', e);
      }

      // Synchronize persistent cookie for zero-flicker SSR on next requests
      document.cookie = `${STORAGE_KEY}=${encodeURIComponent(targetLang)}; path=/; max-age=31536000; SameSite=Lax`;

      // Update document attribute
      if (document.documentElement) {
        document.documentElement.setAttribute('lang', targetLang);
      }

      // Sync any language dropdowns on the page
      document.querySelectorAll('.lang-select, #lang-select, #sidebar-lang-select').forEach(sel => {
        if (sel.value !== targetLang) {
          sel.value = targetLang;
        }
      });

      // Notify backend to synchronize session and user profile
      fetch('/auth/set-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: targetLang })
      }).catch(err => {
        console.warn('LanguageManager: server session sync failed', err);
      });

      // Dispatch event for in-page subscribers
      try {
        window.dispatchEvent(new CustomEvent('edusaarthi:languageChange', {
          detail: { language: targetLang, speechCode: SPEECH_LOCALE_MAP[targetLang] || 'hi-IN' }
        }));
      } catch (e) {}

      if (reload) {
        if (window.showToast) {
          window.showToast('Language updated.', 'success');
        }
        setTimeout(() => {
          window.location.reload();
        }, 120);
      }
    },

    // Legacy setter alias
    set: function (lang) {
      return this.setLanguage(lang, true);
    },

    /**
     * Initialize language state on page load.
     * Ensures localStorage and cookie are in sync, and dropdowns display the right value.
     */
    initializeLanguage: function () {
      let currentLang = DEFAULT_LANG;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          // First visit: set default 'en'
          localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
          currentLang = DEFAULT_LANG;
        } else if (SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
          currentLang = saved;
        } else {
          currentLang = DEFAULT_LANG;
          localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
        }
      } catch (e) {
        currentLang = DEFAULT_LANG;
      }

      // Ensure cookie matches
      const cookieMatch = document.cookie.match(new RegExp('(?:^|;\\s*)' + STORAGE_KEY + '=([^;]*)'));
      const cookieLang = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      if (cookieLang !== currentLang) {
        document.cookie = `${STORAGE_KEY}=${encodeURIComponent(currentLang)}; path=/; max-age=31536000; SameSite=Lax`;
      }

      // Synchronize all selectors
      document.querySelectorAll('.lang-select, #lang-select, #sidebar-lang-select').forEach(sel => {
        if (sel.value !== currentLang) {
          sel.value = currentLang;
        }
      });

      return currentLang;
    },

    /**
     * Get Web Speech locale string for a language without changing global state
     */
    getSpeechLocale: function (lang) {
      const code = lang || this.getCurrentLanguage();
      return SPEECH_LOCALE_MAP[code] || 'hi-IN';
    },

    /**
     * Get label for display (e.g. "हिन्दी" or "English")
     */
    getLanguageLabel: function (lang) {
      const code = lang || this.getCurrentLanguage();
      const match = SUPPORTED_LANGUAGES.find(l => l.code === code);
      return match ? `${match.label} (${match.name})` : 'English';
    }
  };

  // Run early initialization immediately
  LanguageManager.initializeLanguage();

  // Attach to window globally
  window.EduSaarthiLanguage = LanguageManager;
  window.languageManager = LanguageManager;

  // Bind change events once DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    LanguageManager.initializeLanguage();

    // Attach listeners to any language selector dropdown
    document.querySelectorAll('.lang-select, #lang-select, #sidebar-lang-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        LanguageManager.setLanguage(e.target.value, true);
      });
    });
  });
})();
