'use client'

import { useState } from 'react'
import { Mail, Phone, Building2, Send } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function BusinessContact() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission
    alert('Bedankt voor uw aanvraag! We nemen zo snel mogelijk contact met u op.')
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      service: '',
      message: '',
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
          Neem contact met ons op
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Heeft u vragen over onze zakelijke diensten? Neem vrijblijvend contact met ons op voor een offerte of adviesgesprek.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Telefoon</h3>
                <p className="text-gray-600">Ma-Vr: 09:00 - 17:00</p>
                <a href="tel:+31123456789" className="text-primary-600 hover:text-primary-700 font-medium">
                  +31 (0) 123 456 789
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">E-mail</h3>
                <p className="text-gray-600 mb-2">Voor zakelijke vragen</p>
                <a href="mailto:zakelijk@bloemenvandegier.nl" className="text-primary-600 hover:text-primary-700 font-medium">
                  zakelijk@bloemenvandegier.nl
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Kantoor</h3>
                <p className="text-gray-600">
                  Bloemen van De Gier<br />
                  Voor zakelijke afspraken
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Naam *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Uw naam"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrijfsnaam *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Uw bedrijfsnaam"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-mailadres *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="uw@email.nl"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefoonnummer
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+31 6 12345678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Interesse in *
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Selecteer een dienst</option>
                  <option value="kantoor">Kantoorplanten & Groen</option>
                  <option value="evenementen">Evenementen Bloemen</option>
                  <option value="horeca">Horeca Bloemen</option>
                  <option value="cadeaus">Zakelijke Cadeaus</option>
                  <option value="abonnement">Zakelijk Bloemenabonnement</option>
                  <option value="advies">Advies & Consultancy</option>
                  <option value="anders">Anders</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Bericht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Vertel ons over uw wensen en vragen..."
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Verstuur aanvraag
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}
