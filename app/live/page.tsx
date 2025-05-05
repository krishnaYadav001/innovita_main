"use client"

import MainLayout from '@/app/layouts/MainLayout'

export default function LivePage() {
    return (
        <MainLayout>
            <div className="pt-[80px] w-full max-w-[1200px] mx-auto text-black dark:text-white">
                <div className="px-4">
                    <h1 className="text-2xl font-bold mb-6">LIVE</h1>
                    
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="text-6xl mb-4">🎬</div>
                        <h3 className="text-2xl font-bold mb-2 text-center">Live Streaming Coming Soon</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                            We're working on bringing you live streaming capabilities. Stay tuned for updates!
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
