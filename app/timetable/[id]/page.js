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
import checkDatabaseForTimetableId from "@/actions/checkDatabaseForTimetableId";
import Link from "next/link";

const Timetable = () => {
  const { data: session } = useSession();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [isTimetableLoading, setIsTimetableLoading] = useState(true);
  const [timetables, setTimetables] = useState([]);
  const [selectedTT, setSelectedTT] = useState(1);
  const [periods, setPeriods] = useState(0);
  const [idValid, setIdValid] = useState(null);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const router = useRouter();

  const id = params.id;

  useEffect(() => {

    const fetchTimetables = async () => {
      try {
        setLoading(true);
        setVerificationComplete(false);

        if (session === undefined) return;

        if (session) {
          const idPresent = await checkDatabaseForTimetableId(id,session.user.id);

          if (!idPresent) {
            setIdValid(false);
            setVerificationComplete(true);
            return;
          }
          const result = await getGeneratedTimetables(id,session.user.id);
          if (result.data && result.data.length > 0) {
            result.data.sort((a, b) => a.tt_no - b.tt_no);
            result.data.forEach((entry) => {
              const timetable = entry.timetable;

              const sortedDays = Object.keys(timetable).sort(
                (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
              );

              const sortedTimetable = {};
              sortedDays.forEach((day) => {
                sortedTimetable[day] = timetable[day];
              });

              entry.timetable = sortedTimetable;
            });
            setTimetables(result.data);
            const formData = await getFormData(id,session.user.id);
            if (formData) {
              setPeriods(formData.data.periods);
            }
          } else {
            const formData = await getFormData(id,session.user.id);
            if (formData) {
              setPeriods(formData.data.periods);
              const timetable = await generateTimetable(formData.data);
              const res = await storeGeneratedTimetables(timetable, id, 1, session.user.id);
              const result = await getGeneratedTimetables(id,session.user.id);
              if (result.data && result.data.length > 0) {
                result.data.sort((a, b) => a.tt_no - b.tt_no);
                result.data.forEach((entry) => {
                  const timetable = entry.timetable;

                  const sortedDays = Object.keys(timetable).sort(
                    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
                  );

                  const sortedTimetable = {};
                  sortedDays.forEach((day) => {
                    sortedTimetable[day] = timetable[day];
                  });


                  entry.timetable = sortedTimetable;
                });
                setTimetables(result.data);
              }
            }
          }
        }
        else {
          const idPresent = checkLocalStorageForId(id);

          if (!idPresent) {
            setIdValid(false);
            setVerificationComplete(true);
            return;
          }
          const storedTimetables = JSON.parse(localStorage.getItem('generatedtimetables')) || [];
          const matchingTimetables = storedTimetables.filter(item => item.id === id);

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

              const formDataArray = JSON.parse(formDataString);
              const formData = formDataArray.find(item => item.id === id);
              if (formData) {
                setPeriods(formData.data.periods);
                const timetable = await generateTimetable(formData.data).catch(error => {
                  console.log("Error generating timetable:", error);
                  throw error;
                });

                const updatedTimetables = [...storedTimetables, {
                  id,
                  timetable,
                  tt_no: 1
                }];
                localStorage.setItem(
                  'generatedtimetables',
                  JSON.stringify(updatedTimetables)
                );
                setTimetables([{ timetable, tt_no: 1 }]);
              }
            }
          }
        }
        setVerificationComplete(true);
        setIdValid(true);
      } catch (error) {
        console.log("Error fetching timetable:", error);
        setIdValid(false);
        setVerificationComplete(true);
        if (error.message.includes("not found") || error.message.includes("invalid")) {
          router.push('/timetables');
        }
      } finally {
        setLoading(false);
        setIsTimetableLoading(false);
      }
    };

    fetchTimetables();
  }, [id, session?.user?.email]);

  const checkLocalStorageForId = (id) => {
    try {
      const storedTimetables = JSON.parse(localStorage.getItem('timetables')) || [];
      return storedTimetables.some(item => item.timetable_id === id);
    } catch (error) {
      console.error("LocalStorage ID check failed:", error);
      return false;
    }
  };

  const handleRegenerate = (tt_no) => async () => {

    setIsTimetableLoading(true);
    try {
      if (session) {
        const formData = await getFormData(id,session.user.id);
        if (formData) {
          const timetable = await generateTimetable(formData.data);
          const res = await storeGeneratedTimetables(timetable, id, tt_no, session.user.id);
          const result = await getGeneratedTimetables(id,session.user.id);
          if (result.data && result.data.length > 0) {
            result.data.sort((a, b) => a.tt_no - b.tt_no);
            result.data.forEach((entry) => {
              const timetable = entry.timetable;

              const sortedDays = Object.keys(timetable).sort(
                (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
              );

              const sortedTimetable = {};
              sortedDays.forEach((day) => {
                sortedTimetable[day] = timetable[day];
              });

              entry.timetable = sortedTimetable;
            });
            setTimetables(result.data);
          }
        }
      } else {

        const formDataString = localStorage.getItem('formData');
        const formDataArray = JSON.parse(formDataString);
        const formData = formDataArray.find(item => item.id === id);

        if (formData) {
          const timetable = await generateTimetable(formData.data);
          const storedTimetables = JSON.parse(localStorage.getItem('generatedtimetables')) || [];

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
      console.log("Error regenerating timetable:", error);
    } finally {
      setIsTimetableLoading(false);
    }
  };

  const createAnotherTimetable = async () => {
    setIsTimetableLoading(true);
    try {
      const tt_no = timetables.length + 1;
      setSelectedTT(tt_no);

      if (session) {
        const formData = await getFormData(id,session.user.id);
        if (formData) {
          const timetable = await generateTimetable(formData.data);
          const res = await storeGeneratedTimetables(timetable, id, tt_no, session.user.id);
          const result = await getGeneratedTimetables(id,session.user.id);
          if (result.data && result.data.length > 0) {
            result.data.sort((a, b) => a.tt_no - b.tt_no);
            result.data.forEach((entry) => {

              const timetable = entry.timetable;
              const sortedDays = Object.keys(timetable).sort(
                (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
              );

              const sortedTimetable = {};
              sortedDays.forEach((day) => {
                sortedTimetable[day] = timetable[day];
              });

              entry.timetable = sortedTimetable;
            });
            setTimetables(result.data);
          }
        }
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
      console.log("Error adding new timetable:", error);
    } finally {
      setIsTimetableLoading(false);
    }
  };

  if (loading || !verificationComplete) {
    return (
      <>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="mt-16 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pt-20 flex justify-center items-center flex-1">
            <div className="max-w-7xl mx-auto px-4py-12">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Generating your timetable...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (idValid === false) {
    return (
      <>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="mt-16 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pt-20 flex justify-center items-center flex-1">
            <div className="mx-auto px-4 py-12">
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Timetable Not Found</h3>
                <p className="mt-2 text-sm text-gray-500">The requested timetable doesn&apos;t exist.</p>
                <button
                  onClick={() => router.push('/timetables')}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Back to Your Timetables
                </button>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (!timetables.length) {
    return (
      <>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="mt-16 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pt-20 flex justify-center items-center flex-1">
            <div className="mx-auto px-4 py-12">
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">No timetable generated</h3>
                <p className="mt-2 text-sm text-gray-500">We couldn&apos;t find any timetable for this ID.</p>
                <div className="mt-4 flex flex-col items-center justify-center">
                  <div className="max-w-md text-center">
                    <p className="mb-6 text-gray-600">
                      Oops! No timetable was generated. Let&apos;s try submitting the data again.
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
                      or <Link href="/" className="text-[#8e44ad] hover:underline">return home</Link>
                    </p>
                  </div>
                </div>
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
        <div className="mt-16 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pb-16 max-sm:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 max-md:py-6 max-sm:py-4">
            <div className="text-center mb-10 max-md:mb-8 max-sm:mb-6">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8e44ad] to-[#3498db] mb-4 max-2xl:text-3xl max-xl:text-3xl max-lg:text-2xl max-md:text-xl max-sm:text-lg">
                Your Generated Timetables
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto max-xl:text-base max-lg:text-sm max-md:text-sm max-sm:text-xs">
                Browse through the different timetable options we&apos;ve created for you
              </p>
            </div>

            <div className="flex justify-center items-center mb-8 space-x-4 max-lg:flex-wrap max-lg:gap-4 max-lg:space-x-0">
              <button
                onClick={() => setSelectedTT(prev => Math.max(1, prev - 1))}
                disabled={selectedTT === 1}
                className="p-2 rounded-full bg-white shadow-md disabled:opacity-50 hover:bg-gray-100 transition-colors max-sm:p-1.5"
              >
                <FaChevronLeft className="text-[#8e44ad] max-sm:text-sm" />
              </button>

              <div className="flex justify-center items-center mb-8 space-x-4 max-lg:mb-4 max-lg:order-3 max-lg:w-full max-lg:justify-center max-md:flex-wrap max-md:gap-2">
                {timetables.map((_, index) => (
                  <div key={index} className="flex items-center space-x-2 max-md:space-x-1">
                    <button
                      onClick={() => setSelectedTT(index + 1)}
                      className={`px-5 py-2 rounded-lg shadow-md transition-all max-md:px-3 max-md:py-1 max-md:text-sm max-sm:text-xs ${selectedTT === index + 1
                        ? 'bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white'
                        : 'bg-white hover:bg-gray-50'
                        }`}
                    >
                      Option {index + 1}
                    </button>
                    <button
                      className="p-2 text-[#8e44ad] hover:bg-gray-100 rounded-full transition-colors max-md:p-1"
                      onClick={handleRegenerate(index + 1)}
                      title="Regenerate this option"
                    >
                      <LuRefreshCcw className="text-lg max-md:text-base" />
                    </button>
                  </div>
                ))}

                {timetables.length < 3 && (
                  <button
                    onClick={() => createAnotherTimetable()}
                    className="px-4 py-2 bg-white border border-[#8e44ad] text-[#8e44ad] rounded-lg hover:bg-gray-50 max-md:px-3 max-md:py-1 max-md:text-sm max-sm:text-xs"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedTT(prev => Math.min(timetables.length, prev + 1))}
                disabled={selectedTT === timetables.length}
                className="p-2 rounded-full bg-white shadow-md disabled:opacity-50 hover:bg-gray-100 transition-colors max-sm:p-1.5"
              >
                <FaChevronRight className="text-[#8e44ad] max-sm:text-sm" />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8 max-md:rounded-lg max-sm:rounded-md">
              <div className="px-6 py-4 border-b border-gray-200 max-md:px-4 max-md:py-3 max-sm:px-3 max-sm:py-2">
                <h2 className="text-xl font-semibold text-gray-800 max-md:text-lg max-sm:text-base">
                  Timetable Option {selectedTT}
                </h2>
              </div>

              <div className="overflow-x-auto max-w-full">
                {isTimetableLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 min-h-[50vh]">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-[#8e44ad] to-[#3498db] opacity-75"></div>
                      <div className="w-12 h-12 bg-white rounded-full border-4 border-transparent border-t-[#8e44ad] border-b-[#3498db] animate-spin"></div>
                    </div>
                    <p className="mt-3 text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#8e44ad] to-[#3498db] animate-pulse">
                      Loading Timetable...
                    </p>
                  </div>
                ) : (
                  <>
                    <table className="w-full max-md:text-sm max-sm:text-xs">
                      <thead className="bg-gradient-to-r from-[#8e44ad] to-[#3498db] text-white">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider max-md:px-4 max-md:py-2 max-sm:px-2 max-sm:py-1">
                            Day
                          </th>
                          {Array.from({ length: periods }).map((_, index) => (
                            <th
                              key={index}
                              className="px-4 py-3 text-center text-sm font-medium uppercase tracking-wider min-w-28 max-md:px-2 max-md:py-1.5 max-sm:px-1 max-sm:py-1"
                            >
                              Period {index + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(timetables[selectedTT - 1]?.timetable || {}).map(([day, schedule]) => (
                          <tr key={day} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 max-md:px-4 max-md:py-2 max-sm:px-2 max-sm:py-1">
                              {day}
                            </td>
                            {schedule.map((subject, index) => (
                              <td
                                key={index}
                                className={`px-4 py-4 text-center max-md:px-2 max-md:py-2 max-sm:px-1 max-sm:py-1 ${!subject ? 'text-gray-400 italic' : 'text-gray-700'}`}
                              >
                                {subject ? (
                                  <div className="flex flex-col">
                                    <span className="font-medium max-sm:font-normal">{subject.name}{subject.type === "Lab" && " (Lab)"}</span>
                                    <span className="text-xs text-gray-500 max-sm:text-xxs">{subject.teacher}</span>
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
                  </>
                )

                }
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Timetable;