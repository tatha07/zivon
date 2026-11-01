// GnaniVoiceTutor — voice-first anchored physics tutor for Indian learners.
// Powered by the Gnani Artha sovereign AI stack:
// 1. Prisma v2.5 (STT — handles code-mixed speech & noisy audio)
// 2. Evon v3.3 (Reasoning LLM — patient, Socratic, step-by-step)
// 3. Timbre v2.5 (TTS — natural Indic voice & prosody with selectable voices)
// Note: Strict Field Notes doctrine — no emojis, no status dots.

import { useEffect, useRef, useState } from 'react'

interface Message {
  id: string
  sender: 'user' | 'tutor'
  text: string
  source?: string
}

interface GnaniVoice {
  id: string
  name: string
  gender: string
  language: string
  description: string
}

const DEFAULT_VOICES: GnaniVoice[] = [
  { id: 'meera', name: 'Meera', gender: 'Female', language: 'hi-IN', description: 'Friendly Hindi & Hinglish tutor' },
  { id: 'arvind', name: 'Arvind', gender: 'Male', language: 'hi-IN', description: 'Calm academic Hindi tutor' },
  { id: 'kavya', name: 'Kavya', gender: 'Female', language: 'hi-IN', description: 'Expressive Hinglish tutor' },
  { id: 'aditya', name: 'Aditya', gender: 'Male', language: 'hi-IN', description: 'Step-by-step Socratic tutor' },
  { id: 'priya', name: 'Priya', gender: 'Female', language: 'en-IN', description: 'Clear Indian English tutor' },
  { id: 'rohit', name: 'Rohit', gender: 'Male', language: 'en-IN', description: 'Modern Indian English tutor' },
  { id: 'ananya', name: 'Ananya', gender: 'Female', language: 'hi-IN', description: 'Patient conversational tutor' },
  { id: 'vikram', name: 'Vikram', gender: 'Male', language: 'hi-IN', description: 'Formal physics instructor' },
]

interface GnaniVoiceTutorProps {
  topicTitle: string
  classLevel?: string
  chapterTag?: string
  equation?: string
}

export default function GnaniVoiceTutor({
  topicTitle,
  classLevel = 'Class 9–12',
  chapterTag = '',
  equation = '',
}: GnaniVoiceTutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `Namaste! I am Zivon, your voice physics tutor. Ask me any doubt about ${topicTitle} in Hindi, English, or mixed Hinglish. Tap Speak Doubt or type below.`,
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [selectedVoiceId, setSelectedVoiceId] = useState('meera')
  const [availableVoices, setAvailableVoices] = useState<GnaniVoice[]>(DEFAULT_VOICES)
  const [gnaniStatus, setGnaniStatus] = useState<{ configured: boolean } | null>(null)

  const recognitionRef = useRef<{
    start: () => void
    stop: () => void
  } | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch Gnani status and voices catalog on mount
  useEffect(() => {
    fetch('/api/gnani/status')
      .then((res) => res.json())
      .then((data) => setGnaniStatus(data))
      .catch(() => setGnaniStatus({ configured: false }))

    fetch('/api/gnani/voices')
      .then((res) => res.json())
      .then((data) => {
        if (data.voices && Array.isArray(data.voices)) {
          setAvailableVoices(data.voices)
        }
      })
      .catch(() => {})
  }, [])

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Setup Web Speech Recognition for real-time streaming STT (Prisma companion)
  useEffect(() => {
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        continuous: boolean
        interimResults: boolean
        lang: string
        start: () => void
        stop: () => void
        onresult: (e: {
          resultIndex: number
          results: Array<Array<{ transcript: string }>>
        }) => void
        onerror: () => void
        onend: () => void
      }
      webkitSpeechRecognition?: new () => {
        continuous: boolean
        interimResults: boolean
        lang: string
        start: () => void
        stop: () => void
        onresult: (e: {
          resultIndex: number
          results: Array<Array<{ transcript: string }>>
        }) => void
        onerror: () => void
        onend: () => void
      }
    }
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-IN'

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setInputText(transcript)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
          setIsListening(true)
        } catch {
          setIsListening(false)
        }
      }
    }
  }

  // Voice synthesis via Gnani Timbre v2.5 with selected voice
  const speakText = async (text: string) => {
    if (!speechEnabled) return
    stopSpeaking()
    setIsSpeaking(true)

    const voiceObj = availableVoices.find((v) => v.id === selectedVoiceId) || availableVoices[0]

    try {
      const res = await fetch('/api/gnani/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoiceId,
          language: voiceObj.language,
          speed: 1.0,
        }),
      })

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('audio')) {
        const blob = await res.blob()
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        activeAudioRef.current = audio
        audio.onended = () => {
          setIsSpeaking(false)
          activeAudioRef.current = null
        }
        audio.onerror = () => {
          setIsSpeaking(false)
          activeAudioRef.current = null
        }
        await audio.play()
        return
      }
    } catch {
      // Continue to client fallback
    }

    // Client speech synthesis fallback with matching voice
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#]/g, ''))
      const voices = window.speechSynthesis.getVoices()

      // Match gender and language if possible
      const isFemale = voiceObj.gender === 'Female'
      const matchedVoice = voices.find((v) => {
        const langMatch = v.lang.startsWith('en-IN') || v.lang.startsWith('hi-IN')
        const nameMatch = isFemale
          ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.includes('Zira') || v.name.includes('Heera')
          : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man') || v.name.includes('Ravi')
        return langMatch && nameMatch
      }) || voices.find((v) => v.lang.includes('IN')) || voices[0]

      if (matchedVoice) utterance.voice = matchedVoice
      utterance.rate = 0.95
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } else {
      setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause()
      activeAudioRef.current = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  const sendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText || inputText).trim()
    if (!textToSend || isLoading) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/gnani/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          topicTitle,
          chapterTag,
          equation,
          history: messages.slice(-4),
        }),
      })

      const data = await res.json()
      const replyText = data.reply || "Aapka sawaal samajh aaya. Kya aap thoda detail me bata sakte hain?"

      const tutorMsg: Message = {
        id: `t-${Date.now()}`,
        sender: 'tutor',
        text: replyText,
        source: data.source,
      }

      setMessages((prev) => [...prev, tutorMsg])
      speakText(replyText)
    } catch {
      const errorMsg: Message = {
        id: `t-err-${Date.now()}`,
        sender: 'tutor',
        text: "Network issue lag raha hai. Kripya dobara poochhein ya screen par di gayi simulation dekhein.",
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  // Topic-anchored sample questions
  const getTopicDoubts = () => {
    const t = topicTitle.toLowerCase()
    if (t.includes('motion')) {
      return [
        'How does slope of s-t graph give velocity?',
        'Acceleration negative ho to kya hota hai?',
        'What is difference between speed and velocity?',
      ]
    }
    if (t.includes('pendulum') || t.includes('oscillation')) {
      return [
        'Why does mass not change the pendulum period?',
        'Agar Moon par le jayein to time period kya hoga?',
        'What is the restoring force here?',
      ]
    }
    if (t.includes('light') || t.includes('reflection')) {
      return [
        'Angle Normal se hi kyu naapte hain, mirror se kyu nahi?',
        'What are the two laws of reflection?',
        'Plane mirror me image virtual kyu hoti hai?',
      ]
    }
    if (t.includes('circuit')) {
      return [
        'What is Ohm’s law V = IR?',
        'Switch open hone par bulb kyu band ho jata hai?',
        'Resistance badhane se current par kya asar padega?',
      ]
    }
    return [
      'Can you explain this formula step-by-step?',
      'How does this simulation relate to the NCERT chapter?',
      'Give me an intuitive everyday example.',
    ]
  }

  return (
    <section aria-labelledby="tutor-heading" className="mt-14 border-t-2 border-ink pt-10">
      {/* Header bar without emojis or status dots */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-notes text-xs font-bold uppercase tracking-[0.18em] text-graphite">
            Voice Tutor · Gnani Artha Stack
          </p>
          <h2 id="tutor-heading" className="mt-1 text-2xl font-extrabold sm:text-3xl text-ink">
            Ask Zivon out loud
          </h2>
        </div>

        {/* Status text badge — clean typography, no dots */}
        <div className="flex flex-col items-start sm:items-end">
          <span className="font-notes text-xs font-bold text-ink border border-ink/40 bg-paper px-2.5 py-1 rounded-sm">
            {gnaniStatus?.configured
              ? 'Gnani Artha: Active (Prisma · Evon · Timbre)'
              : 'Gnani Artha: Ready for API Key'}
          </span>
          <span className="font-notes text-[10px] text-graphite mt-1">
            {gnaniStatus?.configured
              ? 'Private API Key Connected'
              : 'Add GNANI_API_KEY in .env to stream credits'}
          </span>
        </div>
      </div>

      {/* Main Tutor Box (Field Notes paper card) */}
      <div className="mt-6 rounded-sm border border-ink bg-paper-light p-4 sm:p-6 shadow-[2px_2px_0px_0px_var(--ink)]">
        {/* Topic anchor & Voice selector bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-ink/30 pb-3 font-notes text-xs text-graphite">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-ink">Topic Context:</span>
            <span className="text-pen-blue">{topicTitle}</span>
            {chapterTag && <span>· {chapterTag}</span>}
            {equation && <span className="font-bold text-ink">({equation})</span>}
          </div>

          {/* Voice Selector Dropdown (Gnani Timbre range) */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 font-notes text-xs text-ink">
              <span className="text-graphite font-bold">Timbre Voice:</span>
              <select
                value={selectedVoiceId}
                onChange={(e) => {
                  setSelectedVoiceId(e.target.value)
                  stopSpeaking()
                }}
                className="rounded-sm border border-ink/50 bg-paper px-2 py-1 text-xs font-notes font-bold text-ink focus:border-pen-blue focus:outline-none cursor-pointer"
              >
                {availableVoices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender} · {v.language === 'en-IN' ? 'English' : 'Hindi/Hinglish'})
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                if (isSpeaking) stopSpeaking()
                setSpeechEnabled(!speechEnabled)
              }}
              className="font-notes text-xs font-bold text-ink hover:text-pen-blue border border-ink/30 bg-paper px-2 py-1 rounded-sm"
            >
              {speechEnabled ? 'Audio: Spoken' : 'Audio: Muted'}
            </button>

            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="rounded-xs border border-pencil-red bg-paper px-2 py-0.5 text-xs font-bold text-pencil-red"
              >
                Stop Audio
              </button>
            )}
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="max-h-72 min-h-40 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-notes text-[11px] text-graphite">
                <span>{m.sender === 'user' ? 'You' : 'Zivon (Gnani Evon)'}</span>
                {m.sender === 'tutor' && m.source?.includes('live') && (
                  <span className="text-tick-green font-bold">· Live Evon</span>
                )}
              </div>
              <div
                className={`max-w-[88%] rounded-sm p-3.5 text-[15px] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-ink text-paper font-notes text-sm'
                    : 'border border-ink/40 bg-paper text-ink'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.sender === 'tutor' && (
                  <button
                    type="button"
                    onClick={() => speakText(m.text)}
                    className="mt-2 text-xs font-notes font-bold text-pen-blue hover:underline inline-flex items-center gap-1"
                  >
                    Play audio ({availableVoices.find((v) => v.id === selectedVoiceId)?.name || 'Timbre'})
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start">
              <span className="font-notes text-[11px] text-graphite mb-1">Zivon is thinking...</span>
              <div className="rounded-sm border border-ink/40 bg-paper p-3 text-sm text-graphite font-notes flex items-center gap-2">
                <span>Reasoning with Evon v3.3...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Doubts Chips */}
        <div className="mt-4 pt-3 border-t border-ink/20">
          <p className="font-notes text-xs font-bold text-graphite mb-2">
            Suggested doubts (tap to ask):
          </p>
          <div className="flex flex-wrap gap-2">
            {getTopicDoubts().map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => sendMessage(d)}
                className="rounded-sm border border-ink/50 bg-paper px-2.5 py-1 text-left font-notes text-xs text-ink hover:border-pen-blue hover:text-pen-blue transition-colors"
              >
                &ldquo;{d}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Input Controls (Mic + Text) */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          {/* Big Mic Button (Prisma STT) — clean, no emojis */}
          <button
            type="button"
            onClick={toggleMic}
            className={`flex min-h-[46px] items-center justify-center gap-2 rounded-sm px-4 py-2.5 font-notes text-sm font-bold transition-all sm:w-auto ${
              isListening
                ? 'bg-pencil-red text-paper border-2 border-ink'
                : 'bg-pen-blue text-paper hover:bg-ink'
            }`}
            aria-label={isListening ? 'Stop recording voice' : 'Start speaking with Gnani Prisma'}
          >
            <span>{isListening ? 'Stop Listening' : 'Speak Doubt (Hindi / English)'}</span>
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Or type in Hinglish: e.g. 'yahan slope velocity kaise deta hai?'"
              className="w-full min-h-[46px] rounded-sm border border-ink/70 bg-paper px-4 py-2.5 font-notes text-sm text-ink placeholder:text-graphite/70 focus:outline-none focus:border-pen-blue"
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="min-h-[46px] rounded-sm border border-ink bg-ink px-5 py-2.5 font-notes text-sm font-bold text-paper hover:bg-pen-blue disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Ask
          </button>
        </div>

        {/* Voice loop metadata footer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-notes text-[11px] text-graphite pt-2 border-t border-ink/15">
          <span>
            {isListening
              ? 'Prisma v2.5 is listening... Speak code-mixed Hindi, English, or Hinglish.'
              : 'Voice loop: Prisma v2.5 (STT) -> Evon v3.3 (Reasoning) -> Timbre v2.5 (TTS)'}
          </span>
          <span className="text-pen-blue font-bold">
            NCERT Physics {classLevel} · Anchored
          </span>
        </div>
      </div>
    </section>
  )
}
