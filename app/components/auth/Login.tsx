import { ShowErrorObject } from "@/app/types";
import { useState } from "react";
import TextInput from "../TextInput";
import { BiLoaderCircle } from "react-icons/bi";
import { useUser } from "@/app/context/user";
import { useGeneralStore } from "@/app/stores/general";
import { getAccount } from "@/libs/AppWriteClient"; // Use getter function
import { FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<ShowErrorObject | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Force component to re-render when error state changes
    const [, forceUpdate] = useState({});

    const contextUser = useUser();
    const { setIsLoginOpen } = useGeneralStore();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24
            }
        }
    };

    const buttonVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 17
            }
        },
        hover: {
            scale: 1.03,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        tap: { scale: 0.97 }
    };

    const handleGithubLogin = async () => {
        try {
            setLoading(true);
            // Use AppWrite's OAuth2 session creation with specific success URL
            await getAccount().createOAuth2Session( // Use getter
                'github',
                window.location.origin + '/', // Redirect to home page after successful authentication
                window.location.origin + '/login-failed' // Failure redirect URL
            );
            // Note: The above function will redirect the browser, so the code below won't execute
            // unless there's an error that's caught
        } catch (error) {
            console.error('GitHub OAuth error:', error);
            alert('Failed to authenticate with GitHub. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleOAuthLogin = async () => {
        try {
            setLoading(true);
            // Use AppWrite's OAuth2 session creation with specific success URL
            await getAccount().createOAuth2Session( // Use getter
                'google',
                window.location.origin + '/', // Redirect to home page after successful authentication
                window.location.origin + '/login-failed' // Failure redirect URL
            );
            // Note: The above function will redirect the browser, so the code below won't execute
            // unless there's an error that's caught
        } catch (error) {
            console.error('Google OAuth error:', error);
            alert('Failed to authenticate with Google. Please try again.');
            setLoading(false);
        }
    };

    const validate = () => {
        setError(null);
        let isError = false;

        if (!email) {
            setError({ type: 'email', message: 'An Email is required' });
            isError = true;
        } else if (!password) {
            setError({ type: 'password', message: 'A Password is required' });
            isError = true;
        }
        return isError;
    };

    const login = async () => {
        console.log('Login attempt with:', { email, password: '********' });

        let isError = validate();
        if (isError) return;
        if (!contextUser) return;

        try {
            setLoading(true);
            // Clear any previous errors
            setError(null);

            // Try to create a session directly with Appwrite
            try {
                await getAccount().createEmailSession(email, password);

                // If successful, update the user context
                await contextUser.checkUser();

                // Close the login modal
                setLoading(false);
                setIsLoginOpen(false);
            } catch (appwriteError: any) {
                console.error('Appwrite login error:', appwriteError);

                setLoading(false);

                // Handle specific Appwrite error codes
                if (appwriteError.code === 401) {
                    const errorObj = {
                        type: 'auth',
                        message: 'Invalid email or password. Please check your credentials and try again.'
                    };
                    console.log('Setting error state to:', errorObj);
                    setError(errorObj);

                    // Force a re-render
                    forceUpdate({});

                    // Also force a re-render after a short delay
                    setTimeout(() => {
                        console.log('Current error state after timeout:', error);
                        forceUpdate({});
                    }, 100);
                } else {
                    const errorObj = {
                        type: 'auth',
                        message: appwriteError.message || 'Login failed. Please try again later.'
                    };
                    console.log('Setting error state to:', errorObj);
                    setError(errorObj);

                    // Force a re-render
                    forceUpdate({});

                    // Also force a re-render after a short delay
                    setTimeout(() => {
                        forceUpdate({});
                    }, 100);
                }
                return; // Stop execution here
            }
        } catch (error: any) {
            console.error('Login component caught error:', error);
            setLoading(false);

            // Display error in the UI
            const errorObj = {
                type: 'auth',
                message: error.message || 'Login failed. Please check your credentials and try again.'
            };
            setError(errorObj);

            // Force a re-render
            forceUpdate({});

            // Also force a re-render after a short delay
            setTimeout(() => {
                forceUpdate({});
            }, 100);

            // Also log to console for debugging
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                type: error.type,
                code: error.code
            });
        }
    };

    const showError = (type: string) => {
        // Don't show field-specific errors if we're showing an auth error
        if (error && error.type === 'auth') {
            return '';
        }

        // Show field-specific validation errors
        if (error && error.type === type) {
            return error.message;
        }
        return '';
    };

    return (
        <motion.div
            className="w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.h1
                className="text-center text-3xl mb-6 font-bold text-black dark:text-white"
                variants={itemVariants}
            >
                Log in
            </motion.h1>

            {/* Top-level error message - enhanced styling */}
            {error && error.type === 'auth' && (
                <motion.div
                    className="mx-6 mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md text-sm font-medium flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error.message}</span>
                    </div>
                </motion.div>
            )}

            <motion.div
                className="px-6 pb-2"
                variants={itemVariants}
            >
                <TextInput
                    string={email}
                    placeholder="Email address"
                    onUpdate={setEmail}
                    inputType="email"
                    error={showError('email')}
                />
            </motion.div>

            <motion.div
                className="px-6 pb-2"
                variants={itemVariants}
            >
                <TextInput
                    string={password}
                    placeholder="Password"
                    onUpdate={setPassword}
                    inputType="password"
                    error={showError('password')}
                />
            </motion.div>

            {/* Debug log - keeping this for debugging purposes */}
            {(() => { console.log('Rendering error section, error state:', error); return null; })()}

            <motion.div
                className="px-6 pb-2 mt-6"
                variants={itemVariants}
            >
                <motion.button
                    disabled={loading}
                    onClick={() => login()}
                    className={`
                        flex items-center justify-center w-full text-[17px] font-semibold text-white py-3 rounded-full
                        ${(!email || !password) ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#F02C56] hover:bg-[#d12a50]'}
                        transition-colors duration-200
                    `}
                    variants={buttonVariants}
                    whileHover={(!email || !password) ? {} : "hover"}
                    whileTap={(!email || !password) ? {} : "tap"}
                >
                    {loading ? <BiLoaderCircle className="animate-spin" color="#ffffff" size={25} /> : 'Log in'}
                </motion.button>
            </motion.div>

            {/* Divider for alternative login options */}
            <motion.div
                className="flex items-center my-6 px-6"
                variants={itemVariants}
            >
                <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
                <span className="px-4 text-gray-500 text-sm font-medium">or continue with</span>
                <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
            </motion.div>

            {/* Social Login Buttons */}
            <motion.div
                className="grid grid-cols-2 gap-4 px-6 mb-4"
                variants={itemVariants}
            >
                {/* Google Login */}
                <motion.button
                    onClick={handleGoogleOAuthLogin}
                    disabled={loading}
                    className="flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-white text-[15px] font-medium py-3 px-4 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    {loading ? (
                        <BiLoaderCircle className="animate-spin mr-2" color="#5f6368" size={20} />
                    ) : (
                        <FcGoogle className="mr-2" size={20} />
                    )}
                    <span>Google</span>
                </motion.button>

                {/* GitHub Login */}
                <motion.button
                    onClick={handleGithubLogin}
                    disabled={loading}
                    className="flex items-center justify-center bg-gray-900 text-white text-[15px] font-medium py-3 px-4 rounded-full hover:bg-black transition-colors"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    {loading ? (
                        <BiLoaderCircle className="animate-spin mr-2" color="#ffffff" size={20} />
                    ) : (
                        <FaGithub className="mr-2" size={20} />
                    )}
                    <span>GitHub</span>
                </motion.button>
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div
                className="text-center mt-4"
                variants={itemVariants}
            >
                <motion.button
                    className="text-[#F02C56] text-sm font-medium hover:underline"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    Forgot password?
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
