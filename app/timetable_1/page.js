import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const schedule = [
  { day: "Monday", times: ["Math (Mr. Smith)", "English (Ms. Davis)", "History (Mr. Brown)", "Lunch Break", "Science (Ms. Johnson)", "Art (Ms. Lee)"] },
  { day: "Tuesday", times: ["Science (Ms. Johnson)", "Math (Mr. Smith)", "English (Ms. Davis)", "Lunch Break", "History (Mr. Brown)", "Music (Mr. White)"] },
  { day: "Wednesday", times: ["History (Mr. Brown)", "Science (Ms. Johnson)", "Math (Mr. Smith)", "Lunch Break", "English (Ms. Davis)", "Sports (Mr. Green)"] },
  { day: "Thursday", times: ["Math (Mr. Smith)", "History (Mr. Brown)", "Science (Ms. Johnson)", "Lunch Break", "Math (Mr. Smith)", "Drama (Ms. Black)"] },
  { day: "Friday", times: ["Science (Ms. Johnson)", "Math (Mr. Smith)", "History (Mr. Brown)", "Lunch Break", "Science (Ms. Johnson)", "Art (Ms. Lee)"] },
  { day: "Saturday", times: ["Art (Ms. Lee)", "Music (Mr. White)", "Sports (Mr. Green)", "Lunch Break", "Drama (Ms. Black)", "Math (Mr. Smith)"] },
  { day: "Sunday", times: ["Free Time", "Free Time", "Free Time", "Lunch Break", "Free Time", "Free Time"] },
];

const Timetable = () => {
  return (
    <>
      <Navbar />
      <div className="mt-12 flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="bg-white p-10 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">
            Weekly Timetable
          </h1>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-purple-500 text-white uppercase tracking-wider py-3 px-4">Day</th>
                <th className="bg-purple-500 text-white uppercase tracking-wider py-3 px-4">9:00 AM - 10:00 AM</th>
                <th className="bg-purple-500 text-white uppercase tracking-wider py-3 px-4">10:00 AM - 11:00 AM</th>
                <th className="bg-purple-500 text-white uppercase tracking-wider py-3 px-4">11:00 AM - 12:00 PM</th>
                <th className="bg-purple-500 text-white uppercase tracking-wider py-3 px-4">12:00 PM - 1:00 PM</th>
                <th className="bg-purple-500 text-white uppercase tracking-wider py-3 px-4">1:00 PM - 2:00 PM</th>
                <th className="bg-purple-500 text-white uppercase tracking-wider py-3 px-4">2:00 PM - 3:00 PM</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((slot, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-purple-100" : "bg-purple-200"
                  } hover:bg-purple-300`}
                >
                  <td className="border border-gray-300 p-4 text-gray-800 font-semibold">
                    {slot.day}
                  </td>
                  {slot.times.map((time, timeIndex) => (
                    <td
                      key={timeIndex}
                      className="border border-gray-300 p-4 text-gray-700 transition-colors"
                    >
                      {time}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Timetable;
