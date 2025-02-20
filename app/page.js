import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import React from "react";
import { FaArrowRight } from "react-icons/fa";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen mt-16">
        {/* Hero Section */}
        <header className="min-h-[90vh] bg-gradient-to-br from-[#8e44ad] via-[#3498db] to-[#ff8a65] text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-6xl font-extrabold mb-6 leading-tight">
              Transform Your Scheduling <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ffe0b2] to-[#ff8a65]">
                Timetable Genie
              </span>
            </h1>
            <p className="text-lg md:text-xl font-light mb-8 max-w-3xl mx-auto">
              Revolutionizing the way educational institutions design and manage timetables,
              bringing efficiency and scalability to scheduling.
            </p>
            <div className="space-x-4">
              <Link
                href="/timetables"
                className="relative inline-flex items-center text-lg font-semibold text-white px-8 py-4 rounded-xl border border-white shadow-lg bg-gradient-to-r from-[#3498db] to-[#8e44ad] hover:from-[#2c81bd] hover:to-[#722f9a] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#8e44ad]/50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#ffffff33] to-[#ffffff0d] opacity-0 rounded-lg transition-opacity duration-300 group-hover:opacity-20"></span>
                Get Started
                <FaArrowRight className="ml-2 text-xl" />
              </Link>
              <Link
                href="/about"
                className="relative inline-flex items-center text-lg font-semibold text-white px-8 py-4 rounded-xl shadow-lg bg-gradient-to-r from-[#ff8a65] to-[#ffb69d] hover:from-[#ff8a65] hover:to-[#ff6f47] border-2 border-transparent hover:border-[#ff8a65] transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#ff8a65]/50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#ffffff33] to-[#ffffff0d] opacity-0 rounded-lg transition-opacity duration-300 group-hover:opacity-20"></span>
                Learn More
              </Link>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className="bg-gradient-to-br from-[#ffe6cc] to-[#ffefd5] py-16 text-gray-900">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-[#8e44ad]">
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {["Customizable Scheduling", "Teacher Availability", "Lab-Specific Scheduling", "Multiple Options"].map(
                (feature, index) => (
                  <div
                    key={index}
                    className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 border-t-4 border-[#3498db]"
                  >
                    <h3 className="text-xl  font-semibold mb-3 text-[#ff8a65]">{feature}</h3>
                    <p className="text-gray-700">
                      {index === 0
                        ? "Define periods, subjects, and frequencies effortlessly."
                        : index === 1
                          ? "Respect and manage teacher schedules effectively."
                          : index === 2
                            ? "Allocate extended periods for hands-on sessions."
                            : "Choose from several timetable combinations."}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gradient-to-bl from-[#3498db] to-[#8e44ad] py-20 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-12">
              Why Choose Timetable Genie?
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              {["Ease of Use", "Efficiency", "Scalability"].map((benefit, index) => (
                <div
                  key={index}
                  className="flex-1 max-w-sm p-6 bg-white text-gray-900 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  <h3 className="text-xl font-semibold mb-3 text-[#8e44ad]">{benefit}</h3>
                  <p>
                    {index === 0
                      ? "User-friendly interface for quick setup."
                      : index === 1
                        ? "Save time with automated scheduling tools."
                        : "Adaptable to institutions of any size."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
