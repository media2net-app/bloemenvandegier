'use client'

import { useState } from 'react'
import { Play, Video, Info } from 'lucide-react'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

interface ProductVideoProps {
  productName: string
  videoUrl?: string
  careGuide?: {
    title: string
    steps: Array<{ title: string; description: string }>
  }
  className?: string
}

export default function ProductVideo({ productName, videoUrl, careGuide, className }: ProductVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Default care guide if not provided
  const defaultCareGuide = careGuide || {
    title: 'Hoe verzorg je deze bloemen?',
    steps: [
      {
        title: 'Snij de stelen schuin af',
        description: 'Gebruik een scherp mes om de stelen schuin af te snijden. Dit zorgt voor een groter oppervlak voor wateropname.',
      },
      {
        title: 'Verwijder bladeren onder water',
        description: 'Verwijder alle bladeren die onder water zouden komen. Dit voorkomt bacteriegroei en houdt het water langer schoon.',
      },
      {
        title: 'Gebruik schoon water met voeding',
        description: 'Vul de vaas met lauw water en voeg bloemenvoeding toe volgens de instructies op de verpakking.',
      },
      {
        title: 'Plaats op een koele plek',
        description: 'Zet de bloemen op een koele plek, uit de buurt van direct zonlicht, verwarming en fruit.',
      },
      {
        title: 'Ververs het water regelmatig',
        description: 'Ververs het water elke 2-3 dagen en snij de stelen opnieuw schuin af voor optimale versheid.',
      },
    ],
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Video Section */}
      {videoUrl && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Video className="h-5 w-5 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">Product Video</h3>
          </div>
          
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {!isPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="p-6 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all group"
                >
                  <Play className="h-12 w-12 text-primary-600 ml-1 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </Card>
      )}

      {/* Care Guide */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="h-5 w-5 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900">{defaultCareGuide.title}</h3>
        </div>

        <div className="space-y-4">
          {defaultCareGuide.steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Tips */}
        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> Door deze verzorgingstips te volgen, blijven je bloemen langer mooi en vers. 
            Bij Bloemen van De Gier krijg je altijd verse bloemen met 7 dagen versgarantie.
          </p>
        </div>
      </Card>
    </div>
  )
}
