import { ShowErrorObject } from "@/app/types";
import { useState } from "react";
import TextInput from "../TextInput";
import { BiLoaderCircle } from "react-icons/bi";
import { useUser } from "@/app/context/user";
import { useGeneralStore } from "@/app/stores/general";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Register() {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<ShowErrorObject | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    const contextUser = useUser();
    const { setIsLoginOpen } = useGeneralStore();
    const router = useRouter();

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

    const showError = (type: string) => {
        if (error && error.type === type) {
            return error.message;
        }
        return '';
    }

    const validate = () => {
        setError(null)
        let isError = false

        if (!name) {
            setError({ type: 'name', message: 'A Name is required'})
            isError = true
        } else if (!email) {
            setError({ type: 'email', message: 'An Email is required'})
            isError = true
        } else if (!password) {
            setError({ type: 'password', message: 'A Password is required'})
            isError = true
        } else if (password.length < 8) {
            setError({ type: 'password', message: 'Password must be at least 8 characters'})
            isError = true
        } else if (password != confirmPassword) {
            setError({ type: 'password', message: 'The Passwords do not match'})
            isError = true
        }
        return isError
    }

    const register = async () => {
        let isError = validate()
        if (isError) return
        if (!contextUser) return

        try {
            setLoading(true)
            await contextUser.register(name, email, password)
            setLoading(false)
            setIsLoginOpen(false)
            router.refresh()
        } catch (error) {
            console.log(error)
            setLoading(false)
            alert(error)
        }
    }

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
                Create Account
            </motion.h1>

            <motion.div 
                className="px-6 pb-2"
                variants={itemVariants}
            >
                <TextInput 
                    string={name}
                    placeholder="Name"
                    onUpdate={setName}
                    inputType="text"
                    error={showError('name')}
                />
            </motion.div>
            
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

            <motion.div 
                className="px-6 pb-2"
                variants={itemVariants}
            >
                <TextInput 
                    string={confirmPassword}
                    placeholder="Confirm Password"
                    onUpdate={setConfirmPassword}
                    inputType="password"
                    error={showError('confirmPassword')}
                />
            </motion.div>

            <motion.div 
                className="px-6 pb-2 mt-6"
                variants={itemVariants}
            >
                <motion.button
                    disabled={loading}
                    onClick={() => register()}
                    className={`
                        flex items-center justify-center w-full text-[17px] font-semibold text-white py-3 rounded-full
                        ${(!name || !email || !password || !confirmPassword) ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#F02C56] hover:bg-[#d12a50]'}
                        transition-colors duration-200
                    `}
                    variants={buttonVariants}
                    whileHover={(!name || !email || !password || !confirmPassword) ? {} : "hover"}
                    whileTap={(!name || !email || !password || !confirmPassword) ? {} : "tap"}
                >
                    {loading ? <BiLoaderCircle className="animate-spin" color="#ffffff" size={25} /> : 'Sign up'}
                </motion.button>
            </motion.div>

            <motion.div 
                className="px-6 mt-6 text-[12px] text-gray-600 dark:text-gray-400"
                variants={itemVariants}
            >
                <p className="text-center">
                    By signing up, you agree to our{' '}
                    <a href="#" className="text-[#F02C56] hover:underline">Terms of Service</a>{' '}
                    and acknowledge that our{' '}
                    <a href="#" className="text-[#F02C56] hover:underline">Privacy Policy</a>{' '}
                    applies to you.
                </p>
            </motion.div>
        </motion.div>
    );
}
