'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Star, Truck, Shield, Heart, Minus, Plus, MessageSquare, ChevronDown, ChevronUp, Gift, X, Clock } from 'lucide-react'
import Price from '@/components/shared/Price'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import CardPreview from '@/components/product/CardPreview'
import RibbonSelector from '@/components/product/RibbonSelector'
import DeliveryDate from '@/components/product/DeliveryDate'
import { useCartStore } from '@/lib/cart/store'
import { useCart } from '@/components/cart/CartProvider'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { cleanDescription as cleanDesc, getDescriptionPreview as getPreview } from '@/lib/utils/cleanDescription'
import { getProductVariants } from '@/lib/data/products'

interface ProductInfoProps {
  id: number
  name: string
  price: string
  regularPrice?: string
  description: string
  shortDescription?: string
  stockStatus: string
  stockQuantity?: number | null
  averageRating?: string
  ratingCount?: number
  sku?: string
  permalink: string
  slug?: string
  image: string
  onAddToCartDataChange?: (data: {
    quantity: number
    price: string
    totalAddonPrice: number
    selectedVariant: { id: number; name: string; price: string; quantity: number } | null
    onAddToCart: () => void
  }) => void
}

export default function ProductInfo({
  id,
  name,
  price,
  regularPrice,
  description,
  shortDescription,
  stockStatus,
  stockQuantity,
  averageRating,
  ratingCount,
  sku,
  permalink,
  slug,
  image,
  onAddToCartDataChange,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [totalRoses, setTotalRoses] = useState(10) // Standaard 10 rozen voor roze-rozen-xxl
  const [cardMessage, setCardMessage] = useState('')
  const [ribbonText, setRibbonText] = useState('')
  const [ribbonColor, setRibbonColor] = useState('rood')
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  
  // Check if this is the roze-rozen-xxl product
  const isRozeRozenXXL = slug === 'roze-rozen-xxl'
  // Check if this is the plukboeket-xl product (Thursday Deal)
  const isPlukboeketXL = slug === 'plukboeket-xl'
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeOption, setActiveOption] = useState<'card' | 'ribbon' | 'addons' | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<{ id: number; name: string; price: string; quantity: number } | null>(null)
  const [showVariantDropdown, setShowVariantDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const addItem = useCartStore((state) => state.addItem)
  const { openCart } = useCart()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVariantDropdown(false)
      }
    }

    if (showVariantDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showVariantDropdown])

  // Get product variants if available
  const currentProduct = { id, name, price, slug: permalink.replace('/product/', '') }
  const variants = getProductVariants(currentProduct as any)
  const hasVariants = variants.length > 1

  // Get quantity from product name or variant
  const getQuantityFromName = (productName: string): number => {
    const match = productName.match(/(\d+)\s*(rozen|roos)/i)
    return match ? parseInt(match[1]) : 1
  }

  // Initialize selected variant
  const baseDisplayPrice = selectedVariant ? selectedVariant.price : price
  // For variants (rozen), use variant quantity; for normal products (boeketten), use quantity state
  const displayQuantity = selectedVariant 
    ? selectedVariant.quantity 
    : (hasVariants ? getQuantityFromName(name) : quantity)
  
  // Calculate price for roze-rozen-xxl: base price (10 rozen) + extra rozen (€1 per roos)
  const baseRoses = 10
  const basePrice = isRozeRozenXXL ? parseFloat(price) : 0 // €19,50 voor 10 rozen
  const extraRoses = isRozeRozenXXL ? Math.max(0, totalRoses - baseRoses) : 0
  const extraRosesPrice = isRozeRozenXXL ? extraRoses * 1.00 : 0
  const finalPrice = isRozeRozenXXL ? (basePrice + extraRosesPrice).toFixed(2) : baseDisplayPrice
  
  // For roze-rozen-xxl, use calculated final price, otherwise use base price
  const displayPrice = isRozeRozenXXL ? finalPrice : baseDisplayPrice

  // Available addons (can be made dynamic later)
  // Images loaded directly from live website
  const availableAddons: Array<{ id: string; name: string; price: number; description: string; image: string }> = [
    { 
      id: 'hart', 
      name: 'Hart in het midden', 
      price: 1.50, 
      description: 'Voeg een rood hart toe in het midden van je boeket',
      image: 'https://www.bloemenvandegier.nl/wp-content/uploads/2024/01/hart-500x500.png.jpg'
    },
    { 
      id: 'witte-roos', 
      name: 'Witte roos in het midden', 
      price: 1.50, 
      description: 'Voeg een witte roos toe in het midden',
      image: 'https://www.bloemenvandegier.nl/wp-content/uploads/2024/01/witte-roos-500x500.png.jpg'
    },
    { 
      id: 'beertje', 
      name: 'Beertje in het midden', 
      price: 3.95, 
      description: 'Voeg een beertje toe in het midden',
      image: 'https://www.bloemenvandegier.nl/wp-content/uploads/2024/01/beertje-in-midden-400x400-1.webp'
    },
    { 
      id: 'vaas', 
      name: 'Glazen vaas', 
      price: 9.95, 
      description: 'Voeg een glazen vaas toe aan je bestelling',
      image: 'https://www.bloemenvandegier.nl/wp-content/uploads/2024/01/vaas-500x500.png.jpg'
    },
  ]

  const handleAddToCart = useCallback(() => {
    // Prepare addons data
    const addonsData = selectedAddons.map(addonId => {
      const addon = availableAddons.find(a => a.id === addonId)
      return addon ? {
        id: addon.id,
        name: addon.name,
        price: addon.price,
      } : null
    }).filter((addon): addon is { id: string; name: string; price: number } => addon !== null)
    
    // Add extra rozen as addon if selected (only for roze-rozen-xxl)
    if (isRozeRozenXXL && extraRoses > 0) {
      addonsData.push({
        id: 'extra-rozen',
        name: `${extraRoses} extra roos${extraRoses > 1 ? 'en' : ''}`,
        price: extraRosesPrice,
      })
    }

    // Use selected variant if available, otherwise use current product
    const productToAdd = selectedVariant 
      ? {
          id: selectedVariant.id,
          name: selectedVariant.name,
          price: parseFloat(selectedVariant.price),
          quantity: 1,
          image,
          permalink,
          sku,
          addons: addonsData.length > 0 ? addonsData : undefined,
          cardMessage: cardMessage || undefined,
          ribbonText: ribbonText || undefined,
          ribbonColor: ribbonText ? ribbonColor : undefined,
        }
      : {
          id,
          name: isRozeRozenXXL ? `${name} (${totalRoses} rozen)` : name,
          price: parseFloat(displayPrice),
          quantity,
          image,
          permalink,
          sku,
          addons: addonsData.length > 0 ? addonsData : undefined,
          cardMessage: cardMessage || undefined,
          ribbonText: ribbonText || undefined,
          ribbonColor: ribbonText ? ribbonColor : undefined,
        }
    
    addItem(productToAdd)
    // Open cart sidebar after adding item
    openCart()
  }, [selectedVariant, id, name, displayPrice, quantity, image, permalink, sku, addItem, openCart, selectedAddons, availableAddons, cardMessage, ribbonText, ribbonColor, isRozeRozenXXL, extraRoses, extraRosesPrice, totalRoses])

  // Clean description
  const cleanedDescription = cleanDesc(description)
  const descriptionPreview = getPreview(cleanedDescription, 200)
  const hasLongDescription = cleanedDescription.length > 200

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }

  const totalAddonPrice = selectedAddons.reduce((total, addonId) => {
    const addon = availableAddons.find(a => a.id === addonId)
    return total + (addon?.price || 0)
  }, 0)
  
  const totalExtraPrice = totalAddonPrice + extraRosesPrice

  // Notify parent of cart data changes for sticky button
  useEffect(() => {
    if (onAddToCartDataChange) {
      // Use setTimeout to avoid updating during render
      const timeoutId = setTimeout(() => {
        onAddToCartDataChange({
          quantity,
          price: displayPrice,
          totalAddonPrice: totalExtraPrice,
          selectedVariant,
          onAddToCart: handleAddToCart,
        })
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [quantity, displayPrice, totalExtraPrice, selectedVariant, onAddToCartDataChange, handleAddToCart, extraRoses, totalRoses, isRozeRozenXXL])

  const isInStock = stockStatus === 'instock'
  const isOnSale = regularPrice && parseFloat(regularPrice) > parseFloat(price)

  return (
    <div className="space-y-6">
      {/* Title and rating */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
          {name}
        </h1>

        {averageRating && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < Math.floor(parseFloat(averageRating))
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {averageRating} {ratingCount && `(${ratingCount} reviews)`}
            </span>
          </div>
        )}
      </div>

      {/* Price */}
      <div>
        {isRozeRozenXXL ? (
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <Price price={displayPrice} size="lg" />
              {isOnSale && (
                <Badge variant="error" className="ml-3">
                  Aanbieding
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {totalRoses} rozen {extraRoses > 0 && `(${baseRoses} standaard + ${extraRoses} extra)`}
            </p>
          </div>
        ) : (
          <>
            <Price price={displayPrice} regularPrice={regularPrice} size="lg" />
            {isOnSale && (
              <Badge variant="error" className="ml-3">
                Aanbieding
              </Badge>
            )}
          </>
        )}
      </div>

      {/* Thursday Deal Availability - only for plukboeket-xl */}
      {isPlukboeketXL && (
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">
              Donderdag Deal - Beperkte voorraad
            </span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-primary-100">
                Nog beschikbaar
              </span>
              <span className="text-2xl font-bold">
                10 / 40
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-3 mb-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: '75%' }}
              />
            </div>
            
            <p className="text-sm text-primary-100">
              30 van de 40 boeketten al verkocht
            </p>
          </div>
          
          <p className="text-sm text-primary-100 mt-4">
            ⚡ Wees er snel bij! Deze deal is alleen beschikbaar op donderdag en heeft beperkte voorraad.
          </p>
        </div>
      )}

      {/* Stock status */}
      <div>
        {isInStock ? (
          <div className="flex items-center gap-2 text-secondary-600">
            <div className="h-2 w-2 rounded-full bg-secondary-500" />
            <span className="font-medium">
              {stockQuantity !== null && stockQuantity !== undefined
                ? `${stockQuantity} op voorraad`
                : 'Op voorraad'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="font-medium">Niet op voorraad</span>
          </div>
        )}
      </div>

      {/* Delivery date */}
      <DeliveryDate />

      {/* Option Cards - 3 cards naast elkaar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kaartje Card */}
        <button
          onClick={() => setActiveOption(activeOption === 'card' ? null : 'card')}
          className={cn(
            'p-6 border-2 rounded-xl transition-all text-left hover:shadow-lg',
            activeOption === 'card'
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 hover:border-primary-300 bg-white'
          )}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={cn(
              'p-4 rounded-full',
              activeOption === 'card' ? 'bg-primary-100' : 'bg-gray-100'
            )}>
              <MessageSquare className={cn(
                'h-8 w-8',
                activeOption === 'card' ? 'text-primary-600' : 'text-gray-600'
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Persoonlijk kaartje</h3>
              <p className="text-sm text-gray-600">Voeg een persoonlijke boodschap toe</p>
            </div>
            {cardMessage && (
              <div className="text-xs text-primary-600 font-medium">
                ✓ Kaartje toegevoegd
              </div>
            )}
          </div>
        </button>

        {/* Lint Card */}
        <button
          onClick={() => setActiveOption(activeOption === 'ribbon' ? null : 'ribbon')}
          className={cn(
            'p-6 border-2 rounded-xl transition-all text-left hover:shadow-lg',
            activeOption === 'ribbon'
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 hover:border-primary-300 bg-white'
          )}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={cn(
              'p-4 rounded-full',
              activeOption === 'ribbon' ? 'bg-primary-100' : 'bg-gray-100'
            )}>
              <Gift className={cn(
                'h-8 w-8',
                activeOption === 'ribbon' ? 'text-primary-600' : 'text-gray-600'
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Lint toevoegen</h3>
              <p className="text-sm text-gray-600">Kies kleur en tekst voor lint</p>
            </div>
            {ribbonText && (
              <div className="text-xs text-primary-600 font-medium">
                ✓ Lint toegevoegd
              </div>
            )}
          </div>
        </button>

        {/* Extra opties Card */}
        <button
          onClick={() => setActiveOption(activeOption === 'addons' ? null : 'addons')}
          className={cn(
            'p-6 border-2 rounded-xl transition-all text-left hover:shadow-lg',
            activeOption === 'addons'
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 hover:border-primary-300 bg-white'
          )}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className={cn(
              'p-4 rounded-full',
              activeOption === 'addons' ? 'bg-primary-100' : 'bg-gray-100'
            )}>
              <Heart className={cn(
                'h-8 w-8',
                activeOption === 'addons' ? 'text-primary-600' : 'text-gray-600'
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Extra toevoegingen</h3>
              <p className="text-sm text-gray-600">Maak je bestelling speciaal</p>
            </div>
            {selectedAddons.length > 0 && (
              <div className="text-xs text-primary-600 font-medium">
                ✓ {selectedAddons.length} {selectedAddons.length === 1 ? 'optie' : 'opties'} geselecteerd
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Kaartje sectie - Alleen zichtbaar wanneer actief */}
      {activeOption === 'card' && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="font-semibold text-gray-900">
              <MessageSquare className="inline h-4 w-4 mr-2 text-primary-600" />
              Persoonlijk kaartje toevoegen
            </label>
            <button
              onClick={() => setActiveOption(null)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Sluiten"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <CardPreview 
            message={cardMessage} 
            onChange={setCardMessage}
          />
        </Card>
      )}

      {/* Lint sectie - Alleen zichtbaar wanneer actief */}
      {activeOption === 'ribbon' && (
        <div className="relative">
          <button
            onClick={() => setActiveOption(null)}
            className="absolute top-0 right-0 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          <RibbonSelector
            ribbonText={ribbonText}
            ribbonColor={ribbonColor}
            onTextChange={setRibbonText}
            onColorChange={setRibbonColor}
          />
        </div>
      )}

      {/* Extra toevoegingen sectie - Alleen zichtbaar wanneer actief */}
      {activeOption === 'addons' && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Maak je bestelling extra speciaal
            </h3>
            <button
              onClick={() => setActiveOption(null)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Sluiten"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="space-y-3">
            {availableAddons.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id)
              return (
                <div
                  key={addon.id}
                  className={cn(
                    'flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all',
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  )}
                  onClick={() => handleAddonToggle(addon.id)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleAddonToggle(addon.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 flex-shrink-0"
                  />
                  {/* Addon Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    {addon.image ? (
                      <Image
                        src={addon.image}
                        alt={addon.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs p-2 text-center">
                        {addon.name}
                      </div>
                    )}
                  </div>
                  {/* Addon Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1">{addon.name}</div>
                    <div className="text-sm text-gray-600">{addon.description}</div>
                  </div>
                  {/* Price */}
                  <div className="font-semibold text-primary-600 flex-shrink-0">
                    {formatPrice(addon.price)}
                  </div>
                </div>
              )
            })}
          </div>
          {totalAddonPrice > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between font-semibold">
                <span>Extra toevoegingen:</span>
                <span className="text-primary-600">{formatPrice(totalAddonPrice)}</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Quantity selector - Aantal rozen (voor varianten) of Aantal boeketten (voor normale producten) */}
      {hasVariants ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Kies het aantal rozen:</label>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowVariantDropdown(!showVariantDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-primary-500 transition-colors"
            >
              <span className="font-medium text-gray-900">
                {selectedVariant 
                  ? `${selectedVariant.quantity} Rozen: ${formatPrice(selectedVariant.price)}`
                  : `${displayQuantity} Rozen: ${formatPrice(displayPrice)}`
                }
              </span>
              <ChevronDown className={cn(
                "h-5 w-5 text-gray-500 transition-transform",
                showVariantDropdown && "transform rotate-180"
              )} />
            </button>
            
            {showVariantDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {variants.map((variant) => {
                  const variantQuantity = getQuantityFromName(variant.name)
                  const isSelected = selectedVariant?.id === variant.id || (!selectedVariant && variant.id === id)
                  
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant({
                          id: variant.id,
                          name: variant.name,
                          price: variant.price,
                          quantity: variantQuantity
                        })
                        setShowVariantDropdown(false)
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors",
                        isSelected && "bg-primary-50 border-l-4 border-primary-500"
                      )}
                    >
                      <div className="font-medium text-gray-900">
                        {variantQuantity} Rozen: {formatPrice(variant.price)}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Aantal rozen - alleen voor roze-rozen-xxl */}
          {isRozeRozenXXL && (
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Aantal rozen:</label>
                <select
                  value={totalRoses}
                  onChange={(e) => setTotalRoses(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  {Array.from({ length: 21 }, (_, i) => i + 10).map((num) => {
                    const extra = num - 10
                    const extraPrice = extra * 1.00
                    const totalPrice = basePrice + extraPrice
                    return (
                      <option key={num} value={num}>
                        {num} rozen {num === 10 ? '(standaard)' : `(+${formatPrice(extraPrice.toFixed(2))})`} - {formatPrice(totalPrice.toFixed(2))}
                      </option>
                    )
                  })}
                </select>
              </div>
              <p className="text-xs text-gray-600">
                Standaard: 10 rozen voor {formatPrice(basePrice.toFixed(2))}. 
                {extraRoses > 0 && ` Je hebt ${extraRoses} extra roos${extraRoses > 1 ? 'en' : ''} geselecteerd (+${formatPrice(extraRosesPrice.toFixed(2))}).`}
              </p>
            </div>
          )}
          
          {/* Aantal boeketten */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Aantal boeketten:</label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="Verminder aantal"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="Verhoog aantal"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full"
          onClick={handleAddToCart}
          disabled={!isInStock}
        >
          {isInStock ? 'In bloemenmand' : 'Niet op voorraad'}
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            <Heart className="h-4 w-4 mr-2" />
            Favorieten
          </Button>
          <Button variant="outline" className="flex-1">
            Delen
          </Button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-t border-gray-200 pt-6 space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Truck className="h-5 w-5 text-primary-600" />
          <span>Gratis bezorging vanaf €50</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Shield className="h-5 w-5 text-primary-600" />
          <span>7 dagen versgarantie</span>
        </div>
        {sku && (
          <div className="text-sm text-gray-500">
            SKU: {sku}
          </div>
        )}
      </div>

      {/* Description with read more */}
      {cleanedDescription && (
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Beschrijving</h2>
          <div className="text-gray-700 leading-relaxed">
            {showFullDescription ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: cleanedDescription }}
              />
            ) : (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: descriptionPreview }}
              />
            )}
            {hasLongDescription && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                {showFullDescription ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Lees minder
                  </>
                ) : (
                  <>
                    Lees meer
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
