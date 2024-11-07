import { ShowErrorObject } from "@/app/types";
import { useState } from "react";
import TextInput from "../TextInput";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { BiLoaderCircle } from "react-icons/bi";
import { useUser } from "@/app/context/user";
import { useGeneralStore } from "@/app/stores/general";
import { jwtDecode } from "jwt-decode";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Login() {
    let { setIsLoginOpen } = useGeneralStore();
    const contextUser = useUser();

    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<ShowErrorObject | null>(null);

    const showError = (type: string) => {
        if (error && Object.entries(error).length > 0 && error?.type === type) {
            return error.message;
        }
        return '';
    };

    const linkedInClientId = '86h87j1o2fkxf9';
    const redirectUri = 'http://localhost:3000/auth/linkedin/callback';
    const linkedInLoginUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedInClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=r_liteprofile%20r_emailaddress`;

    const handleLinkedInLogin = () => {
        window.location.href = linkedInLoginUrl;
    };

    const githubClientId = 'Ov23lickf314csFKd4GZ';
   const redirectUriG = 'http://localhost:3000/auth/github/callback'; // or your live URL
    ;

    const githubLoginUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUriG)}&scope=user`;

    const handleGithubLogin = () => {
        window.location.href = githubLoginUrl;
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

    const handleSuccess = (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            const decoded = jwtDecode(credentialResponse.credential);  
            console.log("Decoded JWT:", decoded);
        }
        console.log("Login success:", credentialResponse);
    };

    const handleError = () => {
        console.log("Login error");
    };

    const login = async () => {
        let isError = validate();
        if (isError) return;
        if (!contextUser) return;

        try {
            setLoading(true);
            await contextUser.login(email, password);
            setLoading(false);
            setIsLoginOpen(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
            alert(error);
        }
    };

    return (
        <>
            <div>
                <h1 className="text-center text-[28px] mb-4 font-bold">Log in</h1>
                <div className="px-6 pb-2">
                    <TextInput 
                        string={email}
                        placeholder="Email address"
                        onUpdate={setEmail}
                        inputType="email"
                        error={showError('email')}
                    />
                </div>

                <div className="px-6 pb-2">
                    <TextInput 
                        string={password}
                        placeholder="Password"
                        onUpdate={setPassword}
                        inputType="password"
                        error={showError('password')}
                    />
                </div>

                <div className="px-6 pb-2 mt-6">
                    <button 
                        disabled={loading}
                        onClick={() => login()} 
                        className={`
                            flex items-center justify-center w-full text-[17px] font-semibold text-white py-3 rounded-sm
                            ${(!email || !password) ? 'bg-gray-200' : 'bg-[#F02C56]'}
                        `}
                    >
                        {loading ? <BiLoaderCircle className="animate-spin" color="#ffffff" size={25} /> : 'Log in'}
                    </button>
                </div>

                {/* Divider for alternative login options */}
                <div className="flex items-center my-4">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="px-3 text-gray-500 text-sm">or</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>

                {/* Google Login */}
                <div className="flex items-center justify-center mt-1">
                    <GoogleOAuthProvider clientId="599887123891-clgjmgd3t3p1lkv4du4bl4i7e6f4lglo.apps.googleusercontent.com">
                        <GoogleLogin 
                            onSuccess={handleSuccess}
                            onError={handleError}
                         
                          
                        />
                    </GoogleOAuthProvider>
                </div>

                
                <div className="flex items-center justify-center mt-4">
                <button
                    onClick={handleGithubLogin}
                    className="flex items-center justify-center w-full bg-gray-800 text-white text-[17px] font-semibold py-2 rounded-md hover:bg-gray-900 transition duration-200"
                    style={{ padding: "10px 0" }}
                >
                    <FaGithub className="mr-2" size={20} />
                    <span>Sign in with GitHub</span>
                </button>
            </div>
            </div>
        </>
    );
}
