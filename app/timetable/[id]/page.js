'use client';
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import getGeneratedTimetables from "@/actions/getGeneratedTimetables";
import getFormData from "@/actions/getFormData";
import generateTimetable from "@/actions/generateTimetable";
import storeGeneratedTimetables from "@/actions/storeGeneratedTimetables";
import { FaSync, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { LuRefreshCcw } from "react-icons/lu";
import { useRouter } from "next/navigation";

const Timetable = () => {
  const { data: session } = useSession();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [timetables, setTimetables] = useState([]);
  const [selectedTT, setSelectedTT] = useState(1);
  const [periods, setPeriods] = useState(0);

  const router = useRouter();

  const id = params.id;

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        if (session) {
          const result = await getGeneratedTimetables(id);
          if (result && result.length > 0) {
            setTimetables(result);
            console.log(result);
            const formData = await getFormData(id);
            setPeriods(formData.data.periods);
          } else {
            const formData = await getFormData(id);
            setPeriods(formData.data.periods);
            const timetable = await generateTimetable(formData);
            await storeGeneratedTimetables(timetable, id, 1);
            setTimetables([timetable]);
          }
        } else {
          const storedTimetables = JSON.parse(localStorage.getItem('generatedtimetables')) || [];
          const matchingTimetables = storedTimetables.filter(item => item.id === id);
          console.log(matchingTimetables)

          if (matchingTimetables.length > 0) {
            setTimetables(matchingTimetables);
            const formDataString = localStorage.getItem('formData');
            const formDataArray = JSON.parse(formDataString);
            const formData = formDataArray.find(item => item.id === id);
            if (formData) {
              setPeriods(formData.data.periods);
            }
          } else {
            const formDataString = localStorage.getItem('formData');
            if (formDataString) {
              console.log("hi")
              const formDataArray = JSON.parse(formDataString);
              const formData = formDataArray.find(item => item.id === id);
              if (formData) {
                setPeriods(formData.data.periods);
                const timetable = await generateTimetable(formData.data);
                const updatedTimetables = [...storedTimetables, { id, timetable, tt_no: 1 }];
                localStorage.setItem('generatedtimetables', JSON.stringify(updatedTimetables));
                setTimetables([timetable]);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching timetable:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, [id, session]);

  const handleRegenerate = (tt_no) => async () => {
    setLoading(true);
    try {
      if (session) {
        // For authenticated users
        const formData = await getFormData(id);
        const timetable = await generateTimetable(formData.data);
        await storeGeneratedTimetables(timetable, id, tt_no);
        setTimetables(prev => {
          const updatedTimetables = [...prev];
          updatedTimetables[tt_no - 1] = { ...timetable, tt_no };
          return updatedTimetables;
        });
      } else {
        // For guest users (local storage)
        const formDataString = localStorage.getItem('formData');
        const formDataArray = JSON.parse(formDataString);
        const formData = formDataArray.find(item => item.id === id);

        if (formData) {
          const timetable = await generateTimetable(formData.data);
          const storedTimetables = JSON.parse(localStorage.getItem('generatedtimetables')) || [];

          // Update only the specific timetable
          const updatedTimetables = storedTimetables.map(item =>
            item.id === id && item.tt_no === tt_no
              ? { ...item, timetable }
              : item
          );

          localStorage.setItem('generatedtimetables', JSON.stringify(updatedTimetables));
          setTimetables(updatedTimetables.filter(item => item.id === id));
        }
      }
    } catch (error) {
      console.error("Error regenerating timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">Generating your timetable...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!timetables.length) {
    return (
      <>
        <Navbar />
        <div className="min-h-[93dvh] bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">No timetable generated</h3>
              <p className="mt-2 text-sm text-gray-500">We couldn't find any timetable for this ID.</p>
              <div className="mt-4 flex flex-col items-center justify-center">
                <div className="max-w-md text-center">
                  <p className="mb-6 text-gray-600">
                    Oops! No timetable was generated. Let's try submitting the data again.
                  </p>
                  <button
                    onClick={() => router.push(`/form/${id}`)}
                    className="relative px-6 py-3 bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Go to form
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#3498db] to-[#8e44ad] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </button>

                  <p className="mt-4 text-sm text-gray-500">
                    or <a href="/" className="text-[#8e44ad] hover:underline">return home</a>
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8e44ad] to-[#3498db] mb-4">
              Your Generated Timetables
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Browse through the different timetable options we've created for you
            </p>
          </div>

          {/* Timetable Selector */}
          <div className="flex justify-center items-center mb-8 space-x-4">
            <button
              onClick={() => setSelectedTT(prev => Math.max(1, prev - 1))}
              disabled={selectedTT === 1}
              className="p-2 rounded-full bg-white shadow-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
            >
              <FaChevronLeft className="text-[#8e44ad]" />
            </button>

            <div className="flex justify-center items-center mb-8 space-x-4">
              {timetables.map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedTT(index + 1)}
                    className={`px-5 py-2 rounded-lg shadow-md transition-all ${selectedTT === index + 1
                      ? 'bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white'
                      : 'bg-white hover:bg-gray-50'
                      }`}
                  >
                    Option {index + 1}
                  </button>
                  <button
                    className="p-2 text-[#8e44ad] hover:bg-gray-100 rounded-full transition-colors"
                    onClick={handleRegenerate(index + 1)}
                    title="Regenerate this option"
                  >
                    <LuRefreshCcw className="text-lg" />
                  </button>
                </div>
              ))}

              {/* Add new timetable button (up to 3) */}
              {timetables.length < 3 && (
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const tt_no = timetables.length + 1;
                      if (session) {
                        const formData = await getFormData(id);
                        const timetable = await generateTimetable(formData.data);
                        await storeGeneratedTimetables(timetable, id, tt_no);
                        setTimetables(prev => [...prev, { ...timetable, tt_no }]);
                      } else {
                        const formDataString = localStorage.getItem('formData');
                        const formDataArray = JSON.parse(formDataString);
                        const formData = formDataArray.find(item => item.id === id);
                        if (formData) {
                          const timetable = await generateTimetable(formData.data);
                          const storedTimetables = JSON.parse(localStorage.getItem('generatedtimetables')) || [];
                          localStorage.setItem('generatedtimetables',
                            JSON.stringify([...storedTimetables, { id, timetable, tt_no }])
                          );
                          setTimetables(prev => [...prev, { timetable, tt_no }]);
                        }
                      }
                    } catch (error) {
                      console.error("Error adding new timetable:", error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-white border border-[#8e44ad] text-[#8e44ad] rounded-lg hover:bg-gray-50"
                >
                  + Add Option
                </button>
              )}
            </div>

            <button
              onClick={() => setSelectedTT(prev => Math.min(timetables.length, prev + 1))}
              disabled={selectedTT === timetables.length}
              className="p-2 rounded-full bg-white shadow-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
            >
              <FaChevronRight className="text-[#8e44ad]" />
            </button>
          </div>

          {/* Timetable Display */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Timetable Option {selectedTT}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Day
                    </th>
                    {Array.from({ length: periods }).map((_, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider"
                      >
                        Period {index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(timetables[selectedTT - 1]?.timetable || {}).map(([day, schedule]) => (
                    <tr key={day} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {day}
                      </td>
                      {schedule.map((subject, index) => (
                        <td
                          key={index}
                          className={`px-4 py-4 text-center ${!subject ? 'text-gray-400 italic' : 'text-gray-700'}`}
                        >
                          {subject ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{subject.name}{subject.type === "Lab" && " (Lab)"}</span>

                              <span className="text-xs text-gray-500">{subject.teacher}</span>
                            </div>
                          ) : (
                            "--"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-3 bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center">
              <FaSync className="mr-2" />
              Generate Another Variant
            </button>
            <button className="px-6 py-3 bg-white border border-[#8e44ad] text-[#8e44ad] rounded-lg shadow-md hover:bg-gray-50 transition-all">
              Download as PDF
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Timetable;