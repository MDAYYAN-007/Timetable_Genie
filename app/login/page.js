"use client";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FiLoader, FiLogIn, FiLogOut, FiUser, FiLock, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import Footer from "@/components/Footer";

export default function AuthComponent() {
    const { data: session, status } = useSession();
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await signIn("credentials", { 
                username: credentials.username, 
                password: credentials.password, 
                isSignUp: "false",
                redirect: false 
            });

            if (result?.error) {
                setError(result.error);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (session) {
        return (
            <>
                <Navbar />
                <div className="min-h-[85vh] flex items-center justify-center bg-gray-50">
                    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
                                <FiUser className="h-8 w-8 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
                            <p className="text-gray-600 mt-2">Signed in as {session.user.email}</p>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/timetables"
                                className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
                            >
                                <span>View Timetables</span>
                                <FiArrowRight className="ml-2" />
                            </Link>

                            <button
                                onClick={() => signOut()}
                                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                            >
                                <FiLogOut className="mr-2" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="mt-16 min-h-screen bg-gray-50 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Welcome to Timetable Genie</h1>
                            <p className="text-gray-600 mt-2">Sign in to manage your timetables</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
                                <FiAlertCircle className="flex-shrink-0 mr-2" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={() => signIn("google")}
                                className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                                disabled={isLoading}
                            >
                                <img
                                    src="/images/googleicon.png"
                                    alt="Google"
                                    className="h-5 w-5 mr-3"
                                />
                                <span>Continue with Google</span>
                                {isLoading && <FiLoader className="ml-2 animate-spin" />}
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="text-gray-400" />
                                        </div>
                                        <input
                                            id="username"
                                            type="email"
                                            placeholder="Enter your username"
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
                                            placeholder="Enter your password"
                                            value={credentials.password}
                                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            required
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
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <FiLogIn className="mr-2" />
                                            Sign in
                                        </>
                                    )}
                                </button>
                            </form>
                            
                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link href="/signup" className="text-purple-600 hover:underline">
                                        Sign up here
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}