"use client"

import { useState } from 'react'
import { useCartStore } from '@/app/stores/cart'
import { Product } from '@/app/types'
import { BsCart3, BsCartCheck } from 'react-icons/bs'

interface AddToCartButtonProps {
  product: Product
  className?: string
  showText?: boolean
}

export default function AddToCartButton({ product, className = '', showText = true }: AddToCartButtonProps) {
  const { addToCart, items } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)
  
  // Check if product is already in cart
  const isInCart = items.some(item => item.id === product.id)
  
  const handleAddToCart = () => {
    if (isInCart) return
    
    setIsAdding(true)
    addToCart(product, 1)
    
    // Reset button state after animation
    setTimeout(() => {
      setIsAdding(false)
    }, 1000)
  }
  
  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`flex items-center justify-center gap-2 bg-[#F02C56] hover:bg-opacity-90 text-white rounded-md transition-all ${isInCart ? 'bg-green-600' : ''} ${isAdding ? 'animate-pulse' : ''} ${className}`}
    >
      {isInCart ? (
        <>
          <BsCartCheck size={18} />
          {showText && <span>Added to Cart</span>}
        </>
      ) : (
        <>
          <BsCart3 size={18} />
          {showText && <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>}
        </>
      )}
    </button>
  )
}
