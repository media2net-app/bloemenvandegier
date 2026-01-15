'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Send } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

interface Question {
  id: number
  question: string
  answer: string
  author?: string
  date: string
  helpful?: number
}

interface ProductQAProps {
  productId: number
  productName: string
  className?: string
}

// Mock Q&A data - in production this would come from an API
const mockQuestions: Question[] = [
  {
    id: 1,
    question: 'Hoe lang blijven deze bloemen mooi?',
    answer: 'Met de juiste verzorging blijven deze bloemen gemiddeld 7-10 dagen mooi. Volg de verzorgingstips op de productpagina voor het beste resultaat.',
    author: 'Bloemen van De Gier',
    date: '2024-01-15',
    helpful: 12,
  },
  {
    id: 2,
    question: 'Kunnen deze bloemen bezorgd worden op een specifieke datum?',
    answer: 'Ja, je kunt bij het afrekenen een bezorgdatum kiezen. We bezorgen van maandag tot zaterdag. Bestel vandaag voor 23:59 voor bezorging morgen mogelijk.',
    author: 'Bloemen van De Gier',
    date: '2024-01-10',
    helpful: 8,
  },
  {
    id: 3,
    question: 'Zijn deze bloemen geschikt als cadeau?',
    answer: 'Absoluut! Deze bloemen zijn perfect als cadeau. Je kunt er een persoonlijk kaartje bijvoegen tijdens het afrekenen.',
    author: 'Bloemen van De Gier',
    date: '2024-01-08',
    helpful: 15,
  },
]

export default function ProductQA({ productId, productName, className }: ProductQAProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [questions, setQuestions] = useState<Question[]>(mockQuestions)

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) return

    // In production, this would be an API call
    const newQuestion: Question = {
      id: questions.length + 1,
      question: questionText,
      answer: '', // Will be answered by admin
      date: new Date().toISOString().split('T')[0],
    }

    setQuestions([newQuestion, ...questions])
    setQuestionText('')
    setShowQuestionForm(false)
    // Show success message
    alert('Bedankt voor je vraag! We zullen deze zo snel mogelijk beantwoorden.')
  }

  const markHelpful = (questionId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, helpful: (q.helpful || 0) + 1 } : q
      )
    )
  }

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
          Veelgestelde Vragen
        </h2>
      </div>

      <div className="space-y-4 mb-6">
        {questions.map((question) => {
          const isExpanded = expandedQuestions.has(question.id)
          const hasAnswer = !!question.answer

          return (
            <Card key={question.id} className="p-6">
              <button
                onClick={() => toggleQuestion(question.id)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <span className="text-primary-600">Q:</span>
                      {question.question}
                    </h3>
                    {isExpanded && hasAnswer && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-gray-700 flex items-start gap-2">
                          <span className="text-primary-600 font-bold">A:</span>
                          <span>{question.answer}</span>
                        </p>
                        {question.author && (
                          <p className="text-sm text-gray-500 mt-2">
                            — {question.author}
                          </p>
                        )}
                        {question.helpful !== undefined && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markHelpful(question.id)
                            }}
                            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Was dit nuttig? ({question.helpful} mensen vonden dit nuttig)
                          </button>
                        )}
                      </div>
                    )}
                    {isExpanded && !hasAnswer && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-500 italic">
                          Deze vraag is nog niet beantwoord. We werken eraan!
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>
            </Card>
          )
        })}
      </div>

      {/* Ask Question Form */}
      <Card className="p-6">
        {!showQuestionForm ? (
          <button
            onClick={() => setShowQuestionForm(true)}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-gray-700 font-medium"
          >
            <MessageSquare className="h-5 w-5" />
            Stel een vraag over dit product
          </button>
        ) : (
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                Je vraag
              </label>
              <textarea
                id="question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Stel je vraag over dit product..."
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Vraag versturen
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowQuestionForm(false)
                  setQuestionText('')
                }}
              >
                Annuleren
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
