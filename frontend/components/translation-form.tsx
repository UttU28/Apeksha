'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Play, Pause } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const languages = [
  { value: 'te', label: 'Telugu' },
  { value: 'sa', label: 'Sanskrit' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'hi', label: 'Hindi' },
  { value: 'gom', label: 'Gom' },
  { value: 'kn', label: 'Kannada' },
  { value: 'doi', label: 'Dogri' },
  { value: 'brx', label: 'Bodo' },
  { value: 'ur', label: 'Urdu' },
  { value: 'ta', label: 'Tamil' },
  { value: 'ks', label: 'Kashmiri' },
  { value: 'as', label: 'Assamese' },
  { value: 'bn', label: 'Bengali' },
  { value: 'mr', label: 'Marathi' },
  { value: 'sd', label: 'Sindhi' },
  { value: 'mai', label: 'Maithili' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'mni', label: 'Manipuri' },
  { value: 'ne', label: 'Nepali' },
  { value: 'sat', label: 'Santali' },
  { value: 'or', label: 'Odia' },
  { value: 'en', label: 'English' },
]

const translatePrompt = `You are a pronunciation translator. Your primary role is to convert words or sentences provided in various languages (like Telugu, Gujarati, or others) into their English phonetic pronunciation. You are not required to translate the meaning of the words; instead, focus on how they are pronounced in English. Ensure that your output reflects the correct tone and pitch for natural pronunciation. Respond only with the English phonetic transcription, and nothing else.`

interface Translation {
  id: string
  inputText: string
  selectedLanguage: string
  translation: string
  audioContent?: string
  response?: string
}

export default function TranslationForm() {
  const [inputText, setInputText] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const sourceLanguage = 'en'

    try {
      const translateResponse = await fetch(
        'http://192.168.0.132:5000/translate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceLanguage: sourceLanguage,
            content: inputText,
            targetLanguage: selectedLanguage,
          }),
        },
      )

      if (!translateResponse.ok) {
        throw new Error(`HTTP error! status: ${translateResponse.status}`)
      }

      const translationResult = await translateResponse.json()
      if (translationResult.status_code === 200) {
        const translatedText = translationResult.translated_content
        const newTranslation: Translation = {
          id: Date.now().toString(),
          inputText,
          selectedLanguage,
          translation: translatedText,
          audioContent: translationResult.audioContent,
        }

        setTranslations((prev) => [...prev, newTranslation])

        const responseText = `${translatePrompt}: \n\n ${translatedText}`
        const getResponse = await fetch(
          'http://192.168.0.132:5000/getResponse',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: responseText }),
          },
        )

        if (!getResponse.ok) {
          throw new Error(`HTTP error! status: ${getResponse.status}`)
        }

        const responseResult = await getResponse.json()

        setTranslations((prev) =>
          prev.map((t) =>
            t.id === newTranslation.id
              ? { ...t, response: responseResult.response }
              : t,
          ),
        )
      } else {
        setErrorMessage(translationResult.message || 'Translation failed.')
      }
    } catch (error) {
      console.error('Error during translation or follow-up request:', error)
      setErrorMessage('An error occurred while processing the request.')
    } finally {
      setLoading(false)
    }

    setInputText('')
    setSelectedLanguage('')
  }

  const handleClearAll = () => {
    setTranslations([])
    setCurrentlyPlaying(null)
  }

  const handleDelete = (id: string) => {
    setTranslations((prev) => prev.filter((t) => t.id !== id))
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null)
    }
  }

  const handlePlayAudio = (translation: Translation) => {
    if (!translation.audioContent) return

    if (currentlyPlaying === translation.id) {
      setCurrentlyPlaying(null)
    } else {
      if (currentlyPlaying) {
        setCurrentlyPlaying(null)
      }

      const audio = new Audio(
        `data:audio/wav;base64,${translation.audioContent}`,
      )
      audio.onended = () => setCurrentlyPlaying(null)
      audio.play()
      setCurrentlyPlaying(translation.id)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate..."
            className="min-h-[100px]"
            required
          />
          <div className="flex gap-4">
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              required
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Translating...' : 'Translate'}
            </Button>
          </div>
        </form>
      </Card>

      {errorMessage && (
        <div className="mt-4 p-4 border rounded bg-red-50 text-red-600">
          <p>{errorMessage}</p>
        </div>
      )}

      {translations.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClearAll}>
              Clear All
            </Button>
          </div>

          <div className="space-y-4">
            {translations.map((item) => (
              <Card key={item.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Original Text:
                      </p>
                      <p className="text-sm">{item.inputText}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Translation (
                        {
                          languages.find(
                            (l) => l.value === item.selectedLanguage,
                          )?.label
                        }
                        ):
                      </p>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-medium">
                          {item.translation}
                        </p>
                        {item.audioContent && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePlayAudio(item)}
                            className="flex-shrink-0"
                          >
                            {currentlyPlaying === item.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                        {item.response && (
                          <p className="text-sm">{item.response}</p>
                        )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
