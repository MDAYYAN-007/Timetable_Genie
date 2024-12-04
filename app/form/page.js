"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function TimetableForm() {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();
  const [subjects, setSubjects] = useState([]);
  const [teacherAvailability, setTeacherAvailability] = useState({});
  const sections = [
    "Number of Periods",
    "Number of Subjects",
    "Subject Names",
    "Teacher Unavailability",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeSection = sections[currentIndex];

  const handleNext = () => {
    if (currentIndex < sections.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const toggleAvailability = (teacher, day, period) => {
    setTeacherAvailability((prev) => {
      const key = `${teacher}-${day}-${period}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto mt-12 min-h-[84dvh] p-6 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h1 className="text-2xl font-bold text-center">Timetable Form</h1>
          <h2 className="text-xl font-semibold text-gray-700">
            Section: {activeSection}
          </h2>

          {/* Section 1: Number of Periods */}
          {activeSection === "Number of Periods" && (
            <div>
              <label className="block text-sm font-medium">
                Number of Periods
              </label>
              <Controller
                name="periods"
                control={control}
                defaultValue={1}
                rules={{ required: true, min: 1, max: 8 }}
                render={({ field }) => (
                  <input
                    type="number"
                    className="w-full mt-2 p-2 border border-gray-300 rounded"
                    {...field}
                  />
                )}
              />
              {errors.periods && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.periods.type === "required"
                    ? "This field is required."
                    : "Value must be between 1 and 8."}
                </p>
              )}
            </div>
          )}

          {/* Section 2: Number of Subjects */}
          {activeSection === "Number of Subjects" && (
            <div>
              <label className="block text-sm font-medium">
                Number of Subjects
              </label>
              <Controller
                name="numSubjects"
                control={control}
                defaultValue={1}
                rules={{ required: true, min: 1 }}
                render={({ field }) => (
                  <input
                    type="number"
                    className="w-full mt-2 p-2 border border-gray-300 rounded"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      const value = Number(e.target.value);
                      setSubjects(Array.from({ length: value }, () => ""));
                      setValue("subjects", Array.from({ length: value }, () => ""));
                      setValue("frequencies", Array.from({ length: value }, () => 1));
                    }}
                  />
                )}
              />
            </div>
          )}

          {/* Section 3: Subject Names */}
          {activeSection === "Subject Names" && (
            <div className="space-y-4">
              {subjects.map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Controller
                    name={`subjects[${index}]`}
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder={`Subject ${index + 1}`}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name={`frequencies[${index}]`}
                    control={control}
                    defaultValue={1}
                    rules={{ required: true, min: 1 }}
                    render={({ field }) => (
                      <input
                        type="number"
                        className="w-20 p-2 border border-gray-300 rounded"
                        placeholder="Freq"
                        {...field}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Section 4: Teacher Unavailability */}
          {activeSection === "Teacher Unavailability" && (
            <div>
              {subjects.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <label className="block font-medium">
                    Teacher for {subject || `Subject ${index + 1}`}
                  </label>
                  <Controller
                    name={`teachers[${index}]`}
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Teacher Name"
                        {...field}
                      />
                    )}
                  />
                  <div className="grid grid-cols-6 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="col-span-1">
                        <p className="text-sm text-center">{day}</p>
                        {Array.from(
                          { length: getValues("periods") || 1 },
                          (_, i) => i + 1
                        ).map((period) => (
                          <button
                            key={period}
                            type="button"
                            className={`w-full p-2 text-sm border rounded ${
                              teacherAvailability[
                                `${getValues(`teachers[${index}]`)}-${day}-${period}`
                              ]
                                ? "bg-red-500 text-white"
                                : "bg-gray-100"
                            }`}
                            onClick={() =>
                              toggleAvailability(
                                getValues(`teachers[${index}]`),
                                day,
                                period
                              )
                            }
                          >
                            Period {period}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              Previous
            </button>
            {currentIndex === sections.length - 1 ? (
              <Link href='timetable_1'
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Submit
              </Link>
            ) : (
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleNext}
              >
                Next
              </button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
