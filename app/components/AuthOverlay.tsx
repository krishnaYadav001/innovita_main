import { AiOutlineClose } from "react-icons/ai";
import { useGeneralStore } from"@/app/stores/general"
import Login from '@/app/components/auth/Login'
import Register from '@/app/components/auth/Register'
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthOverlay() {
    const { setIsLoginOpen } = useGeneralStore()
    const [isRegister, setIsRegister] = useState<boolean>(false)
    const [mounted, setMounted] = useState<boolean>(false)

    // Mount animation effect
    useEffect(() => {
        setMounted(true)
        // Add overflow hidden to body to prevent scrolling when modal is open
        document.body.style.overflow = 'hidden'
        // Add class to hide top navbar when login modal is open
        document.body.classList.add('login-modal-open')

        return () => {
            document.body.style.overflow = 'auto'
            // Remove class when login modal is closed
            document.body.classList.remove('login-modal-open')
        }
    }, [])

    return (
        <>
            <AnimatePresence>
                <motion.div
                    id="AuthOverlay"
                    className="fixed flex items-center justify-center z-50 top-0 left-0 w-full h-full bg-black bg-opacity-70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="relative bg-white dark:bg-gray-900 w-full max-w-[470px] h-auto min-h-[500px] p-6 rounded-xl shadow-xl mx-4"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                        }}
                    >
                    {/* Close button */}
                    <div className="w-full flex justify-end">
                        <button
                            onClick={() => setIsLoginOpen(false)}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <AiOutlineClose size="20"/>
                        </button>
                    </div>

                    {/* Auth content */}
                    <div className="h-[calc(100%-120px)] overflow-y-auto py-4">
                        {isRegister ? <Register /> : <Login />}
                    </div>

                    {/* Footer - Fixed at bottom */}
                    <div className="flex items-center justify-center py-4 mt-2 border-t dark:border-t-gray-700 w-full">
                        <span className="text-[14px] text-gray-600 dark:text-gray-400">
                            {isRegister ? 'Already have an account?' : 'Don\'t have an account?'}
                        </span>

                        <button
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-[14px] text-[#F02C56] font-semibold pl-1.5"
                        >
                            <span>{isRegister ? 'Log in' : 'Register'}</span>
                        </button>
                    </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </>
    )
}
