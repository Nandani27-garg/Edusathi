/**
 * EduSaarthi - Web Speech API Voice Controller
 * Implements Voice-to-Text (SpeechRecognition) & Text-to-Speech (speechSynthesis)
 * Supports multilingual regional Indian languages: Hindi, Bengali, Odia, Telugu, Marathi, Gujarati, Tamil, English.
 */

const SPEECH_LANG_MAP = {
  hi: 'hi-IN',
  en: 'en-IN',
  bn: 'bn-IN',
  or: 'or-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  ta: 'ta-IN',
  sat: 'hi-IN'
};

window.EduVoice = {
  recognition: null,
  isListening: false,

  getSpeechLangCode(lang) {
    const current = lang || (window.EduSaarthiLanguage ? window.EduSaarthiLanguage.getCurrentLanguage() : (document.documentElement.lang || 'en'));
    return SPEECH_LANG_MAP[current] || 'en-IN';
  },

  // Initialize Speech Recognition
  initRecognition(onResultCallback, onEndCallback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = this.getSpeechLangCode();

    rec.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResultCallback) {
        onResultCallback(finalTranscript || interimTranscript, !!finalTranscript);
      }
    };

    rec.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      this.isListening = false;
      if (onEndCallback) onEndCallback();
    };

    rec.onend = () => {
      this.isListening = false;
      if (onEndCallback) onEndCallback();
    };

    this.recognition = rec;
    return rec;
  },

  // Toggle Voice Listening
  toggleListening(onResult, onStatusChange) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (window.showToast) {
        window.showToast('Voice interaction is not supported in this browser. Try Chrome or Edge.', 'warning');
      } else {
        alert('Voice interaction is not supported in this browser. Try Chrome or Edge.');
      }
      return false;
    }

    if (this.isListening) {
      if (this.recognition) this.recognition.stop();
      this.isListening = false;
      if (onStatusChange) onStatusChange(false);
      return false;
    }

    const rec = this.initRecognition(onResult, () => {
      if (onStatusChange) onStatusChange(false);
    });

    try {
      rec.start();
      this.isListening = true;
      if (onStatusChange) onStatusChange(true);
      if (window.showToast) {
        window.showToast(`Listening in ${this.getSpeechLangCode()}... Speak now.`, 'info');
      }
      return true;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      this.isListening = false;
      if (onStatusChange) onStatusChange(false);
      return false;
    }
  },

  // Text to Speech (Read Aloud)
  speak(text, lang = 'hi') {
    if (!('speechSynthesis' in window)) {
      if (window.showToast) {
        window.showToast('Text-to-speech is not supported in this browser.', 'warning');
      }
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean markdown symbols for natural speech
    const cleanText = text
      .replace(/[#*`_~$\\]/g, '')
      .replace(/\((.*?)\)/g, '$1')
      .replace(/\[(.*?)\]/g, '$1')
      .trim();

    const targetCode = this.getSpeechLangCode(lang);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetCode;
    utterance.rate = 0.92; // Clear, comfortable pace for students
    utterance.pitch = 1.0;

    // Pick best available matching voice
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = targetCode.split('-')[0];
    const matchedVoice = voices.find(v => v.lang.startsWith(targetCode) || v.lang.startsWith(langPrefix));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
    if (window.showToast) {
      window.showToast(`Reading response aloud in ${targetCode} 🔊`, 'info');
    }
  },

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
