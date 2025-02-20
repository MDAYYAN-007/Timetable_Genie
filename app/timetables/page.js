'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiEye, FiEdit, FiTrash2, FiSave } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const Timetables = () => {
  const [timetables, setTimetables] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [editingTimetableId, setEditingTimetableId] = useState(null);
  const [timetableName, setTimetableName] = useState('');
  const [loading, setLoading] = useState(true);
  const modalRef = useRef(null);

  // Load timetables from localStorage on page load
  useEffect(() => {
    try {
      const savedTimetables = localStorage.getItem('timetables');
      if (savedTimetables) {
        setTimetables(JSON.parse(savedTimetables));
      }
    } catch (error) {
      console.error("Failed to load timetables from localStorage", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, []);

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

  // Save the new timetable to localStorage
  const handleCreateTimetable = () => {
    const id = Date.now().toString();
    const newTimetable = { id, name: timetableName };

    const updatedTimetables = [...timetables, newTimetable];
    localStorage.setItem('timetables', JSON.stringify(updatedTimetables));

    setTimetables(updatedTimetables);
    setIsCreateModalOpen(false);
    setTimetableName('');

    toast.success('Timetable created successfully!');
  };

  // Handle deleting timetable
  const handleDeleteTimetable = (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this timetable?');

    if (isConfirmed) {
      const updatedTimetables = timetables.filter(timetable => timetable.id !== id);
      localStorage.setItem('timetables', JSON.stringify(updatedTimetables));
      setTimetables(updatedTimetables);
      toast.error('Timetable deleted successfully!');
    }
  };

  // Handle editing timetable name
  const handleEditTimetableName = (id) => {
    setEditingTimetableId(id);
    const timetableToEdit = timetables.find(timetable => timetable.id === id);
    setTimetableName(timetableToEdit?.name || '');
    setIsEditNameModalOpen(true);
  };

  // Save edited timetable name
  const handleSaveEditedName = () => {
    const updatedTimetables = timetables.map(timetable =>
      timetable.id === editingTimetableId ? { ...timetable, name: timetableName } : timetable
    );
    localStorage.setItem('timetables', JSON.stringify(updatedTimetables));
    setTimetables(updatedTimetables);
    setIsEditNameModalOpen(false);
    setEditingTimetableId(null);
    setTimetableName('');
    toast.success('Timetable name updated successfully!');
  };

  // Render loading screen if still loading
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Toaster />
      <div className="h-[84dvh] bg-gray-50 py-12 mt-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-center text-[#00695c] mb-6">
            Timetables
          </h1>
          <div className="text-center mb-8">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-block bg-gradient-to-r from-[#00695c] to-[#8e44ad] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#4f94b0] transform hover:scale-105 transition-all"
            >
              Create New Timetable
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {timetables.length > 0 ? (
              timetables.map((timetable) => (
                <div
                  key={timetable.id}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <h3 className="text-xl font-semibold text-[#00695c] mb-4">{timetable.name}</h3>
                  <div className="flex justify-between items-center">
                    {/* View Timetable */}
                    <Link
                      href={`/timetable/${timetable.id}`}
                      className="inline-block bg-gradient-to-r from-[#00695c] to-[#8e44ad] text-white font-bold py-2 px-4 rounded hover:bg-[#4f94b0] transform hover:scale-105 transition-all"
                    >
                      View Timetable
                    </Link>

                    <div className="flex items-center gap-4">
                      {/* Edit Timetable */}
                      <Link
                        href={`/form/${timetable.id}`}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <FiEdit className="text-2xl" />
                      </Link>

                      {/* Edit Timetable Name */}
                      <button
                        onClick={() => handleEditTimetableName(timetable.id)}
                        className="text-teal-500 hover:text-teal-600"
                      >
                        <FiSave className="text-2xl" />
                      </button>

                      {/* Delete Timetable */}
                      <button
                        onClick={() => handleDeleteTimetable(timetable.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FiTrash2 className="text-2xl" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No timetables available. Create a new one!</p>
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
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCreateTimetable}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Save
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
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleSaveEditedName}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Save
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
    </>
  );
};

export default Timetables;
