import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen mt-16">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-[#ff7b54] to-[#ffd56b] text-white py-16">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-6">
            <div className="text-left">
              <h1 className="text-5xl font-extrabold mb-4">Timetable Genie</h1>
              <p className="text-lg font-light mb-6">
                Revolutionizing the way educational institutions create schedules.
              </p>
              <div className="space-x-4">
                <Link
                  href="/timetables"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition-transform duration-300 transform hover:scale-105"
                >
                  Get Started
                </Link>
                <Link
                  href="/about"
                  className="bg-[#ffd56b] text-[#ff7b54] border-2 border-[#ff7b54] font-semibold px-6 py-3 rounded-md transition-transform duration-300 transform hover:bg-[#ffbb7b] hover:scale-105"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="bg-[#ffe6cc] py-16 text-gray-800">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-10">
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold mb-2">
                  Customizable Scheduling
                </h3>
                <p className="text-gray-700">
                  Define periods, subjects, and frequencies effortlessly.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold mb-2">Teacher Availability</h3>
                <p className="text-gray-700">
                  Respect and manage teacher schedules effectively.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold mb-2">Lab-Specific Scheduling</h3>
                <p className="text-gray-700">
                  Allocate extended periods for hands-on sessions.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold mb-2">Multiple Options</h3>
                <p className="text-gray-700">
                  Choose from several timetable combinations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-[#e8f8f5] py-16 text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-10">
              Why Choose Timetable Genie?
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex-1 max-w-sm p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold mb-2">Ease of Use</h3>
                <p className="text-gray-700">User-friendly interface for quick setup.</p>
              </div>
              <div className="flex-1 max-w-sm p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold mb-2">Efficiency</h3>
                <p className="text-gray-700">Save time with automated scheduling tools.</p>
              </div>
              <div className="flex-1 max-w-sm p-6 bg-white rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold mb-2">Scalability</h3>
                <p className="text-gray-700">Adaptable to institutions of any size.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
