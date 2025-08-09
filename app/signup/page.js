'use client';
import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiLoader, FiLogIn, FiUser, FiLock, FiLogOut, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import migrateLocalDataToDB from '@/actions/migrateLocalDataToDB';

export default function SignUpPage() {
    const { data: session, status } = useSession();
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        console.log("Sign Up Credentials in handleSignUp :", credentials);

        if (credentials.password !== credentials.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (credentials.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {

            console.log("Attempting to sign up with credentials:", credentials);
            const result = await signIn('credentials', {
                username: credentials.username,
                password: credentials.password,
                isSignUp: 'true',
                redirect: false
            });
            console.log("Sign Up Result:", result);
            if (result?.error) {
                console.log(result.error);
                if (result.error.includes('already exists')) {
                    setError('An account with this email already exists. Try signing in...');
                    setIsLoading(false);
                    return;
                } else {
                    setError(result.error || 'Sign up failed. Please try again.');
                }
            }
            if (result?.ok) {
                setSuccess('Account created successfully! Redirecting to timetables...');
                const formData = JSON.parse(localStorage.getItem("formData") || "[]");
                const timetables = JSON.parse(localStorage.getItem("timetables") || "[]");
                const generatedTimetables = JSON.parse(localStorage.getItem("generatedtimetables") || "[]");
                const res = await migrateLocalDataToDB(timetables, formData, generatedTimetables);
                if (res) {
                    console.log("Local data migrated to DB successfully!");
                }
                router.push("/timetables");
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);

        const formData = JSON.parse(localStorage.getItem("formData") || "[]");
        const timetables = JSON.parse(localStorage.getItem("timetables") || "[]");
        const generatedTimetables = JSON.parse(localStorage.getItem("generatedtimetables") || "[]");

        const UUIDOfStoredData = uuidv4();

        Cookies.set("UUIDOfStoredData", UUIDOfStoredData, { expires: 7 });

        try {
            await savingDraftData(timetables, formData, generatedTimetables, UUIDOfStoredData);
        } catch (error) {
            console.log("Error saving draft:", error);
        }


        signIn("google", { redirect: false });

    };

    if (status === "loading") {
        return (
            <>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <div className="mt-[65px] bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] flex flex-col flex-1 items-center justify-center p-4 max-md:p-3 max-sm:p-2">
                        {/* Animated Logo */}
                        <div className="mb-8 animate-pulse max-md:mb-6 max-sm:mb-4">
                            <div className="w-24 h-24 rounded-xl bg-gradient-to-r from-[#8e44ad] to-[#3498db] flex items-center justify-center shadow-lg max-md:w-20 max-md:h-20 max-sm:w-16 max-sm:h-16">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 text-white max-md:h-10 max-md:w-10 max-sm:h-8 max-sm:w-8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="20" y1="8" x2="20" y2="14"></line>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                            </div>
                        </div>

                        {/* Floating Bubbles Animation */}
                        <div className="relative mt-8 mb-8 h-12 w-24 max-md:mb-6 max-sm:mb-4">
                            <div className="absolute top-0 left-0 w-4 h-4 bg-[#8e44ad] rounded-full animate-float max-sm:w-3 max-sm:h-3" style={{ animationDelay: '0s' }}></div>
                            <div className="absolute top-0 left-1/2 w-3 h-3 bg-[#9b59b6] rounded-full animate-float max-sm:w-2.5 max-sm:h-2.5" style={{ animationDelay: '0.2s' }}></div>
                            <div className="absolute top-0 right-0 w-5 h-5 bg-[#3498db] rounded-full animate-float max-sm:w-4 max-sm:h-4" style={{ animationDelay: '0.4s' }}></div>
                        </div>

                        {/* Text with Gradient Match */}
                        <div className="text-center max-md:w-full">
                            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#8e44ad] to-[#3498db] max-2xl:text-2xl max-xl:text-2xl max-lg:text-xl max-md:text-xl max-sm:text-lg">
                                Welcome to Timetable Genie
                            </h2>
                            <p className="text-gray-600 max-md:text-sm max-sm:text-xs">Securing your login...</p>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    if (session) {
        return (
            <>
                <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef]">
                    <Navbar />
                    <div className="mt-[65px] flex items-center justify-center flex-1 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
                        <div className="backdrop-blur-md bg-white/70 p-10 rounded-2xl shadow-xl max-w-md max-md:p-8 max-sm:p-6 border border-white/40">
                            <div className="text-center mb-8 max-md:mb-6 max-sm:mb-4">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-200 mb-5 max-md:h-14 max-md:w-14 max-sm:h-12 max-sm:w-12">
                                    <FiUser className="h-8 w-8 text-purple-700 max-md:h-6 max-md:w-6" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-gray-800 max-md:text-2xl max-sm:text-xl">Welcome back!</h2>
                                <p className="text-gray-700 mt-2 max-md:text-sm max-sm:text-xs">Signed in as <span className="font-medium text-purple-700">{session.user.email}</span></p>
                            </div>

                            <div className="flex flex-col space-y-4 max-md:space-y-3 max-sm:space-y-2">
                                <Link
                                    href="/timetables"
                                    className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl shadow-lg hover:scale-[1.03] transition-transform duration-300 max-md:px-5 max-md:py-2.5 max-sm:text-sm"
                                >
                                    <span className="font-medium">View Timetables</span>
                                    <FiArrowRight className="ml-2 max-md:ml-1" />
                                </Link>

                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-800 rounded-xl bg-white hover:bg-gray-100 hover:scale-[1.03] transition-transform duration-300 max-md:px-5 max-md:py-2.5 max-sm:text-sm"
                                >
                                    <FiLogOut className="mr-2 max-md:mr-1" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="mt-16 bg-gray-50 flex flex-col flex-1 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-800">Create an Account</h1>
                                <p className="text-gray-600 mt-2">Join Timetable Genie to manage your schedules</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                                    {success}
                                </div>
                            )}

                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all max-md:px-4 max-md:py-2 max-sm:text-sm"
                                disabled={isLoading}
                            >
                                <img
                                    src="\image.png"
                                    alt="Google"
                                    className="h-5 w-5 mr-3 max-md:h-4 max-md:w-4 max-md:mr-2"
                                />
                                <span>Continue with Google</span>
                                {isLoading && <FiLoader className="ml-2 animate-spin max-md:ml-1" />}
                            </button>

                            <div className="relative my-6 max-md:my-4 max-sm:my-3">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm max-sm:text-xs">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="text-gray-400" />
                                        </div>
                                        <input
                                            id="username"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={credentials.username}
                                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="Create a password"
                                            value={credentials.password}
                                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm your password"
                                            value={credentials.confirmPassword}
                                            onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <>
                                            <FiLoader className="animate-spin mr-2" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            <FiLogIn className="mr-2" />
                                            Sign Up
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-purple-600 hover:underline">
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}