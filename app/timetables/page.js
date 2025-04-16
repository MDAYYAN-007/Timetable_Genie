'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import getTimetables from '@/actions/getTimetables';
import storeTimeTable from '@/actions/storeTimetables';
import getUserData from '@/actions/getUserData';
import '@/app/timetables/page.css';
import renameTimetable from '@/actions/renameTimetable';
import deleteTimetable from '@/actions/deleteTimetable';

const Timetables = () => {
  const [timetables, setTimetables] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [editingTimetableId, setEditingTimetableId] = useState(null);
  const [timetableName, setTimetableName] = useState('');
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);
  const [operationLoading, setOperationLoading] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsCreateModalOpen(false);
        setIsEditNameModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadTimetables = async () => {
      try {
        setLoading(true);

        if (session === undefined) return;

        if (session) {
          const timetables = await getTimetables(session.user.email);
          console.log("oiii1", timetables);
          setTimetables(timetables);
        } else {
          const savedTimetables = localStorage.getItem("timetables");
          console.log("oiii3", savedTimetables);
          setTimetables(savedTimetables ? JSON.parse(savedTimetables) : []);
        }
      } catch (error) {
        console.log("Failed to load timetables", error);
        toast.error("Failed to load timetables");
      } finally {
        if (session === undefined) return;
        setLoading(false);
      }
    };

    loadTimetables();
  }, [session?.user?.email, status]);

  // Save the new timetable to localStorage
  const handleCreateTimetable = async () => {
    setOperationLoading(true);
    const id = Date.now().toString();

    try {
      if (!timetableName.trim()) {
        toast.error('Please enter a timetable name');
        return;
      }

      if (session) {
        const newTimetable = { id, name: timetableName };
        const userData = await getUserData(session.user.email);

        if (!userData || !userData.id) {
          throw new Error('Failed to get user data.');
        }

        const user_id = userData.id;
        await storeTimeTable(id, timetableName, user_id);

        const updatedTimetables = await getTimetables(session.user.email);
        setTimetables(updatedTimetables);
      } else if (!session) {
        const newTimetable = { timetable_id: id, name: timetableName };
        const updatedTimetables = [...timetables, newTimetable];
        localStorage.setItem('timetables', JSON.stringify(updatedTimetables));
        setTimetables(updatedTimetables);
      }

      setIsCreateModalOpen(false);
      setTimetableName('');

      toast.success('Timetable created successfully!');
    } catch (error) {
      console.log("Failed to create timetable", error);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteTimetable = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this timetable?');

    if (isConfirmed) {
      setOperationLoading(true);
      try {
        if (session) {
          await deleteTimetable(id, session.user.id);
          const updatedTimetables = await getTimetables(session.user.email);
          setTimetables(updatedTimetables);
          toast.success('Timetable deleted successfully!');
        } else {
          const updatedTimetables = timetables.filter(timetable => timetable.timetable_id !== id);
          localStorage.setItem('timetables', JSON.stringify(updatedTimetables));
          setTimetables(updatedTimetables);
          toast.success('Timetable deleted successfully!');
        }
      } catch (error) {
        console.error("Failed to delete timetable:", error);
        toast.error("Failed to delete timetable");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // Handle editing timetable name
  const handleEditTimetableName = (id) => {
    setEditingTimetableId(id);
    const timetableToEdit = timetables.find(timetable => timetable.timetable_id === id);
    setTimetableName(timetableToEdit?.name || '');
    setIsEditNameModalOpen(true);
  };

  // Handle saving the edited timetable name
  const handleSaveEditedName = async () => {
    setOperationLoading(true);
    try {
      if (!editingTimetableId) return;

      if (session) {
        await renameTimetable(timetableName, editingTimetableId);
        console.log("oiii2");
        const timetables = await getTimetables(session.user.email);
        setTimetables(timetables);
      } else {
        // Update in local storage for guests
        const updatedTimetables = timetables.map(timetable =>
          timetable.timetable_id === editingTimetableId ? { ...timetable, name: timetableName } : timetable
        );
        localStorage.setItem("timetables", JSON.stringify(updatedTimetables));
        setTimetables(updatedTimetables);
      }

      // Reset states
      setIsEditNameModalOpen(false);
      setEditingTimetableId(null);
      setTimetableName("");
      toast.success("Timetable name updated successfully!");
    } catch (error) {
      console.log("Failed to update timetable name:", error);
      toast.error("Failed to update timetable name.");
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="min-h-[93dvh] bg-gray-50 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* Animated SVG Loader */}
              <svg
                className="w-16 h-16 text-[#8e44ad] animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>

              {/* Loading Text with Animation */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-[#00695c] animate-pulse">
                  Loading Your Timetables
                </h2>
                <p className="text-gray-600">
                  Gathering all your schedules...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-64 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-[#00695c] to-[#8e44ad] h-2.5 rounded-full animate-progress"
                  style={{ width: '75%' }}
                ></div>
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
      <div className='min-h-screen flex flex-col'>
        <Navbar />
        <Toaster />
        {operationLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <span className="text-gray-700">Processing your request...</span>
            </div>
          </div>
        )}

        <div className="mt-16 bg-gray-50 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex-1">
          <div className="mx-auto px-4">
            <h1 className="text-4xl mt-8 font-extrabold text-center text-[#00695c] mb-6">
              Timetables
            </h1>
            <div className="text-center mb-8">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-block bg-gradient-to-r from-[#00695c] to-[#8e44ad] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#4f94b0] transform hover:scale-105 transition-all"
              >
                + Create New Timetable
              </button>
            </div>

            <div className="flex flex-wrap gap-8 p-4 justify-center">
              {timetables.length > 0 ? (
                timetables.map((timetable) => (
                  <div
                    key={timetable.timetable_id}
                    className="bg-white w-72 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-200 flex flex-col items-center"
                  >
                    {/* Timetable Name */}
                    <h3 className="text-2xl font-bold text-[#00695c] mb-4 font-serif">{timetable.name}</h3>

                    {/* Action Buttons */}
                    <div className="w-full flex flex-col space-y-3">
                      <Link
                        href={`/timetable/${timetable.timetable_id}`}
                        className="w-full text-center bg-gradient-to-r from-[#00695c] to-[#8e44ad] text-white font-semibold py-2 px-4 rounded-xl hover:from-[#005546] hover:to-[#7d3a98] transition-all transform hover:scale-105 shadow-md"
                      >
                        View Timetable
                      </Link>

                      <Link
                        href={`/form/${timetable.timetable_id}`}
                        className="w-full text-center bg-teal-100 text-[#00695c] font-semibold py-2 px-4 rounded-xl hover:bg-teal-200 transition-all transform hover:scale-105 shadow-md"
                      >
                        Edit Timetable
                      </Link>

                      <button
                        onClick={() => handleEditTimetableName(timetable.timetable_id)}
                        className="w-full text-center bg-purple-100 text-[#8e44ad] font-semibold py-2 px-4 rounded-xl hover:bg-purple-200 transition-all transform hover:scale-105 shadow-md"
                      >
                        Rename Timetable
                      </button>

                      <button
                        onClick={() => handleDeleteTimetable(timetable.timetable_id)}
                        className="w-full text-center bg-red-100 text-red-600 font-semibold py-2 px-4 rounded-xl hover:bg-red-200 transition-all transform hover:scale-105 shadow-md"
                      >
                        Delete Timetable
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 col-span-full py-12 text-lg font-medium">
                  No timetables available. Create a new one!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Create/Edit Timetable Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80" ref={modalRef}>
              <h2 className="text-lg font-semibold mb-4">{editingTimetableId ? 'Edit Timetable' : 'Create New Timetable'}</h2>
              <input
                type="text"
                placeholder="Enter timetable name"
                value={timetableName}
                onChange={(e) => setTimetableName(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg w-full mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCreateTimetable}
                  disabled={operationLoading}
                  className={`px-4 py-2 rounded-lg transition-all ${operationLoading
                    ? 'bg-teal-700 opacity-90 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700'
                    } text-white flex items-center justify-center min-w-[80px]`}
                >
                  {operationLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Timetable Name Modal */}
        {isEditNameModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80" ref={modalRef}>
              <h2 className="text-lg font-semibold mb-4">Edit Timetable Name</h2>
              <input
                type="text"
                placeholder="Enter new timetable name"
                value={timetableName}
                onChange={(e) => setTimetableName(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg w-full mb-4"
                autoFocus
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleSaveEditedName}
                  disabled={operationLoading}
                  className={`px-4 py-2 rounded-lg transition-all ${operationLoading
                    ? 'bg-teal-700 opacity-90 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700'
                    } text-white flex items-center justify-center min-w-[80px]`}
                >
                  {operationLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
                <button
                  onClick={() => setIsEditNameModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
};

export default Timetables;
