'use client'
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';

const Timetables = () => {
  const [timetables, setTimetables] = useState([
    { id: 1, name: 'Class A - Timetable' },
    { id: 2, name: 'Class B - Timetable' },
    { id: 3, name: 'Class C - Timetable' },
  ]);

  const handleCreateTimetable = () => {
    // Here we simulate creating a new timetable
    const newTimetable = {
      id: timetables.length + 1,
      name: `Class ${timetables.length + 1} - Timetable`,
    };
    setTimetables([...timetables, newTimetable]);
  };

  return (
    <>
      <Navbar />
      <div className="h-[84dvh] bg-gray-50 py-12 mt-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-center text-[#00695c] mb-6">
            Manage Timetables
          </h1>
          <div className="text-center mb-8">
            <Link
              href='/form'
              className="inline-block bg-gradient-to-r from-[#00695c] to-[#8e44ad] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#4f94b0] transform hover:scale-105 transition-all"
            >
              Create New Timetable
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {timetables.map((timetable) => (
              <div
                key={timetable.id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <h3 className="text-xl font-semibold text-[#00695c] mb-4">{timetable.name}</h3>
                <Link
                  href={`/timetable_1`}
                  className="inline-block bg-gradient-to-r from-[#00695c] to-[#8e44ad] text-white font-bold py-2 px-4 rounded hover:bg-[#4f94b0] transform hover:scale-105 transition-all"
                >
                  View Timetable
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Timetables;
