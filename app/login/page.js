"use client";

import Navbar from "@/components/Navbar";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
// import Loader from "@/components/Loader";
import { useState } from "react";

export default function AuthComponent() {
    const { data: session } = useSession();
    const [credentials, setCredentials] = useState({ username: "", password: "" });

    if (session === undefined) {
        return <div>Loading...</div>;
    }

    if (session) {
        return (
            <>
                <Navbar />
                <div className="mx-auto mt-12 min-h-[85dvh] p-6 space-y-6">
                    <div className="text-xl font-semibold text-center">Signed in as {session.user.email}</div>
                    <div className="flex gap-4">
                        <button type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-8 py-3 text-center">
                            <Link href="/timetables">View Timetables</Link>
                        </button>
                        <button
                            onClick={() => signOut()}
                            type="button"
                            className="text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-3 text-center"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-75vh flex flex-col justify-center items-center space-y-4">
            <button
                className="flex items-center text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 dark:bg-gray-900 border border-gray-300 rounded-lg shadow-md px-6 py-2 text-lg font-medium dark:text-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => signIn("google")}
            >
                <img src="/images/googleicon.png" alt="Google Icon" className="h-8 w-8 mr-2" />
                <span>Continue with Google</span>
            </button>
            <div className="border-t w-full max-w-xs border-gray-300"></div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    signIn("credentials", { username: credentials.username, password: credentials.password });
                }}
                className="flex flex-col space-y-4 max-w-xs w-full"
            >
                <input
                    type="text"
                    placeholder="Username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300"
                />
                <button
                    type="submit"
                    className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    Sign in with Credentials
                </button>
            </form>
        </div>
    );
}

