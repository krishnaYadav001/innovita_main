"use client"

import { useState } from 'react'
import MainLayout from '@/app/layouts/MainLayout'
import { useCartStore, CartItem } from '@/app/stores/cart'
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl'
import { FaStar, FaRegStar, FaStarHalfAlt, FaTrash } from 'react-icons/fa'
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai'
import ClientOnly from '@/app/components/ClientOnly'
import NavLink from '@/app/components/NavLink'

export default function CartPage() {
  const { items, totalItems, removeFromCart, updateQuantity, updateRating } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Calculate total price
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0)

  // Handle checkout
  const handleCheckout = () => {
    setIsCheckingOut(true)
    // Simulate checkout process
    setTimeout(() => {
      alert('Checkout functionality would be implemented here!')
      setIsCheckingOut(false)
    }, 1500)
  }

  // Star rating component
  const StarRating = ({ rating, productId }: { rating?: number, productId: string }) => {
    const stars = []
    const handleRatingClick = (newRating: number) => {
      updateRating(productId, newRating)
    }

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating || 0)) {
        // Full star
        stars.push(
          <FaStar
            key={i}
            className="text-yellow-400 cursor-pointer"
            onClick={() => handleRatingClick(i)}
          />
        )
      } else if (i === Math.ceil(rating || 0) && (rating || 0) % 1 !== 0) {
        // Half star
        stars.push(
          <FaStarHalfAlt
            key={i}
            className="text-yellow-400 cursor-pointer"
            onClick={() => handleRatingClick(i)}
          />
        )
      } else {
        // Empty star
        stars.push(
          <FaRegStar
            key={i}
            className="text-yellow-400 cursor-pointer"
            onClick={() => handleRatingClick(i)}
          />
        )
      }
    }

    return (
      <div className="flex space-x-1">
        {stars}
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="pt-[80px] w-full max-w-[1200px] mx-auto text-black dark:text-white">
        <div className="px-4">
          <h1 className="text-2xl font-bold mb-6">Shopping Cart ({totalItems} items)</h1>

          <ClientOnly>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="w-full lg:w-2/3">
                {items.length > 0 ? (
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {items.map((item: CartItem) => (
                      <div key={item.id} className="flex flex-col md:flex-row p-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                        {/* Product Image */}
                        <div className="w-full md:w-1/4 mb-4 md:mb-0">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img
                              src={useCreateBucketUrl(item.imageId)}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="w-full md:w-3/4 md:pl-6 flex flex-col">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-500 hover:text-red-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>

                          <p className="text-xl font-bold mt-1">₹{item.price.toFixed(2)}</p>

                          {/* Star Rating */}
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rate this product:</p>
                            <StarRating rating={item.rating} productId={item.id} />
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center mt-4">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 border border-gray-300 dark:border-gray-700 rounded"
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <AiOutlineMinus size={16} />
                            </button>

                            <span className="mx-3 w-8 text-center">{item.quantity}</span>

                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 border border-gray-300 dark:border-gray-700 rounded"
                              aria-label="Increase quantity"
                            >
                              <AiOutlinePlus size={16} />
                            </button>

                            <span className="ml-auto font-semibold">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Looks like you haven't added any products to your cart yet.
                    </p>
                    <NavLink href="/shop">
                      <button className="bg-[#F02C56] text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
                        Browse Products
                      </button>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              {items.length > 0 && (
                <div className="w-full lg:w-1/3">
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 sticky top-[80px]">
                    <h3 className="text-lg font-bold mb-4">Order Summary</h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal ({totalItems} items)</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tax</span>
                        <span>₹{(totalPrice * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>₹{(totalPrice + (totalPrice * 0.1)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-[#F02C56] text-white py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </ClientOnly>
        </div>
      </div>
    </MainLayout>
  )
}
