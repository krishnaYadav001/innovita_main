"use client"

import QuickLogin from "@/app/components/auth/QuickLogin";
import MainLayout from "@/app/layouts/MainLayout";

export default function QuickLoginPage() {
    return (
        <MainLayout>
            <div className="pt-[80px] flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold mb-8 text-center text-black dark:text-white">
                    Quick Login for Testing
                </h1>
                
                <div className="w-full max-w-md">
                    <QuickLogin />
                </div>
                
                <div className="mt-8 p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg max-w-md">
                    <h2 className="font-bold mb-2">Important:</h2>
                    <p className="mb-2">
                        Before using this page, make sure you've created a user in the AppWrite console as described in the SETUP_GUIDE.md file.
                    </p>
                    <p>
                        The default credentials are:
                        <ul className="list-disc ml-5 mt-1">
                            <li>Email: test@example.com</li>
                            <li>Password: Test123!</li>
                        </ul>
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
