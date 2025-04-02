"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller, get } from "react-hook-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import storeFormData from "@/actions/storeFromData";
import { useSession } from "next-auth/react";
import deleteExistingTimetables from "@/actions/deleteExistingTimetables";
import getFormData from "@/actions/getFormData";
import checkDatabaseForTimetableId from "@/actions/checkDatabaseForTimetableId";

export default function TimetableForm() {

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm();

  const params = useParams();
  const id = params.id;

  const router = useRouter();

  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [idValid, setIdValid] = useState(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState(0);

  const updateFormValues = (data) => {
    const { periods, satPeriods, shortBreak, lunchBreak, numSubjects, numLabs, subjects, labs, teachers, labTeachers, teacherAvailability, frequencies, labFrequencies } = data;

    setValue("periods", periods);
    setValue("satPeriods", satPeriods);
    setValue("shortBreak", shortBreak);
    setValue("lunchBreak", lunchBreak);
    setValue("numSubjects", numSubjects);
    setValue("numLabs", numLabs);
    setValue("subjects", subjects);
    setValue("frequencies", frequencies);
    setValue("labs", labs);
    setValue("labFrequencies", labFrequencies);
    setValue("teachers", teachers);
    setValue("labTeachers", labTeachers);
    setValue("teacherAvailability", teacherAvailability);

    setSubjects(subjects);
    setLabNames(labs);
    setSubs(numSubjects);
    setLabs(numLabs);
    setTeachers(teachers);
    setLabTeachers(labTeachers);
    setTeacherAvailability(teacherAvailability);
  };

  const checkLocalStorageForId = (id) => {
    try {
      const storedTimetables = JSON.parse(localStorage.getItem('timetables')) || [];
      return storedTimetables.some(item => item.id === id);
    } catch (error) {
      console.error("LocalStorage ID check failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const updateWidth = () => setDeviceWidth(window.innerWidth);

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  
  }, [])
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setVerificationComplete(false);

      console.log("Session in useEffect of form:", session);

      if (session === undefined) return;

      try {
        if (session) {
          const idPresent = await checkDatabaseForTimetableId(id);
          if (!idPresent) {
            setIdValid(false);
            setVerificationComplete(true);
            return;
          }

          const response = await getFormData(id);
          if (!response.success) {
            console.log(`Failed to fetch: ${response.message}`);
            return;
          }
          updateFormValues(response.data);
        } else {
          const idPresent = checkLocalStorageForId(id);
          if (!idPresent) {
            setIdValid(false);
            setVerificationComplete(true);
            return;
          }

          const savedForms = localStorage.getItem("formData");
          const parsedSavedForms = savedForms ? JSON.parse(savedForms) : [];
          const form = parsedSavedForms.find((form) => form.id === id);

          if (form) {
            updateFormValues(form.data);
          }
        }
        setVerificationComplete(true);
        setIdValid(true);
      } catch (error) {
        console.log("Error fetching form data:", error);
        setIdValid(false);
        setVerificationComplete(true);
      } finally {
        setVerificationComplete(true);
        setLoading(false);
      }
    };

    fetchData();

  }, [session?.user?.email, id]);

  const [subjects, setSubjects] = useState([]);
  const [labNames, setLabNames] = useState([]);
  const [subs, setSubs] = useState(0);
  const [labs, setLabs] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [labTeachers, setLabTeachers] = useState([]);
  const [teacherAvailability, setTeacherAvailability] = useState({});

  const sections = [
    "Period Structure & Breaks",
    "Number of Subjects",
    "Subject Names And Frequencies",
    "Lab Names And Frequencies",
    "Teacher Names",
    "Teacher Unavailability",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeSection = sections[currentIndex];

  const handleNext = async () => {
    const sectionValidationMap = {
      "Period Structure & Breaks": ["periods", "satPeriods", "shortBreak", "lunchBreak"],
      "Number of Subjects": ["numSubjects", "numLabs"],
      "Subject Names And Frequencies": ["subjects", "frequencies"],
      "Lab Names And Frequencies": ["labs", "labFrequencies"],
      "Teacher Names": "teachers",
    };

    const currentField = sectionValidationMap[activeSection];
    const isValid = await trigger(currentField);

    if (Array.isArray(currentField) && currentField.includes("numSubjects") || currentField.includes("numLabs")) {
      const currentSubjects = getValues("subjects") || [];

      if (subs > currentSubjects.length) {
        const newSubjects = Array.from(
          { length: subs - currentSubjects.length },
          (_, i) => `Subject ${currentSubjects.length + i + 1}`
        );
        const updatedSubjects = [...currentSubjects, ...newSubjects];
        setValue("subjects", updatedSubjects);
        setSubjects(updatedSubjects);
      } else if (subs < currentSubjects.length) {
        const updatedSubjects = currentSubjects.slice(0, subs);
        setValue("subjects", updatedSubjects);
        setSubjects(updatedSubjects);
      }

      const currentFrequencies = getValues("frequencies") || [];

      if (subs > currentFrequencies.length) {
        const newFrequencies = Array.from(
          { length: subs - currentFrequencies.length },
          () => 1
        );
        setValue("frequencies", [...currentFrequencies, ...newFrequencies]);
      } else if (subs < currentFrequencies.length) {
        setValue("frequencies", currentFrequencies.slice(0, subs));
      }

      const currentLabNames = getValues("labs") || [];

      if (labs > currentLabNames.length) {
        const newLabNames = Array.from(
          { length: labs - currentLabNames.length },
          (_, i) => `Lab ${currentLabNames.length + i + 1}`
        );
        const updatedLabNames = [...currentLabNames, ...newLabNames];
        setValue("labs", updatedLabNames);
        setLabNames(updatedLabNames);
      } else if (labs < currentLabNames.length) {
        setValue("labs", currentLabNames.slice(0, labs));
        setLabNames(currentLabNames.slice(0, labs));
      }

      const currentLabFrequencies = getValues("labFrequencies") || [];
      // console.log("Current Lab Frequencies:", currentLabFrequencies.length);
      if (labs > currentLabFrequencies.length) {
        const newLabFrequencies = Array.from(
          { length: labs - currentLabFrequencies.length },
          () => 1
        );
        setValue("labFrequencies", [...currentLabFrequencies, ...newLabFrequencies]);
      } else if (labs < currentLabFrequencies.length) {
        setValue("labFrequencies", currentLabFrequencies.slice(0, labs));
      }

      const currentTeachers = getValues("teachers") || [];

      if (subs > currentTeachers.length) {
        const newTeachers = Array.from(
          { length: subs - currentTeachers.length },
          (_, i) => `Teacher ${currentTeachers.length + i + 1}`
        );
        const updatedTeachers = [...currentTeachers, ...newTeachers];
        setValue("teachers", updatedTeachers);
        setTeachers(updatedTeachers);
      } else if (subs < currentTeachers.length) {
        const updatedTeachers = currentTeachers.slice(0, subs);
        setValue("teachers", updatedTeachers);
        setTeachers(updatedTeachers);
      }

      const currentLabTeachers = getValues("labTeachers") || [];

      if (labs > currentLabTeachers.length) {
        const newLabTeachers = Array.from(
          { length: labs - currentLabTeachers.length },
          (_, i) => `Lab Teacher ${currentLabTeachers.length + i + 1}`
        );
        const updatedLabTeachers = [...currentLabTeachers, ...newLabTeachers];
        setValue("labTeachers", updatedLabTeachers);
        setLabTeachers(updatedLabTeachers);
      } else if (labs < currentLabTeachers.length) {
        const updatedLabTeachers = currentLabTeachers.slice(0, labs);
        setValue("labTeachers", updatedLabTeachers);
        setLabTeachers(updatedLabTeachers);
      }

      await new Promise(resolve => setTimeout(resolve, 0));

      setTimeout(() => {
        const newCurrentTeachers = getValues("teachers") || [];
        const newCurrentLabTeachers = getValues("labTeachers") || [];
        const allTeachers = [...newCurrentTeachers, ...newCurrentLabTeachers];

        const updatedTeacherAvailability = { ...teacherAvailability };
        const weekdayPeriods = getValues("periods") || 1;
        const saturdayPeriods = getValues("satPeriods") || 0;
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        allTeachers.forEach((teacher) => {
          days.forEach((day) => {
            const periods = day === "Sat" ? saturdayPeriods : weekdayPeriods;
            for (let period = 1; period <= periods; period++) {
              const key = `${teacher}-${day}-${period}`;
              if (updatedTeacherAvailability[key] == undefined) {
                updatedTeacherAvailability[key] = true;
              }
            }
          });
        });

        setTeacherAvailability(updatedTeacherAvailability);
        setValue("teacherAvailability", updatedTeacherAvailability);
      }, 100);
    }

    if (Array.isArray(currentField) && currentField.includes("subjects")) {
      const currentSubjects = getValues("subjects") || [];
      setSubjects(currentSubjects);
      // setTimeout(() => {
      //   console.log("Subjects:", subjects);
      // }, 100);
    }

    if (isValid && currentIndex < sections.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = async () => {
    const sectionValidationMap = {
      "Period Structure & Breaks": ["periods", "satPeriods", "shortBreak", "lunchBreak"],
      "Number of Subjects": ["numSubjects", "numLabs"],
      "Subject Names And Frequencies": ["subjects", "frequencies"],
      "Lab Names And Frequencies": ["labs", "labFrequencies"],
      "Teacher Names": "teachers",
    };

    const currentField = sectionValidationMap[activeSection];
    const isValid = await trigger(currentField);

    if (isValid && currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const toggleAvailability = (teacher, day, period) => {
    const currentTeacherAvailability = { ...teacherAvailability };
    const key = `${teacher}-${day}-${period}`;
    currentTeacherAvailability[key] = !currentTeacherAvailability[key];
    setTimeout(() => {
      setTeacherAvailability(currentTeacherAvailability);
      setValue("teacherAvailability", currentTeacherAvailability);
    }, 100);
  };

  const onSubmit = async (data) => {
    // console.log("Form Data:", data);

    if (session) {
      const result = await storeFormData(id, data);

      // console.log("Result of storing formData in database:", result);

      if (result.success) {
        await deleteExistingTimetables(id);
        router.push(`/timetable/${id}`);
        // console.log("Form data stored successfully.");
      } else {
        console.log("Error storing form data:", result.message);
      }
    } else {
      const savedForms = localStorage.getItem("formData");
      const parsedSavedForms = savedForms ? JSON.parse(savedForms) : [];

      const filteredForms = parsedSavedForms.filter((form) => form.id !== id);

      const allForms = [...filteredForms, { id, data }];
      localStorage.setItem("formData", JSON.stringify(allForms));

      const storedTimetables = JSON.parse(localStorage.getItem('generatedtimetables') || []);
      const updatedTimetables = storedTimetables.filter(timetable => timetable.id !== id);
      localStorage.setItem('generatedtimetables', JSON.stringify(updatedTimetables));
      console.log('Deleted existing timetables from localStorage');

      router.push(`/timetable/${id}`);

    }
  };

  if (loading || !verificationComplete) {
    return (
      <>
        <Navbar />
        <div className="min-h-[93dvh] bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pt-20 flex justify-center items-center">
          <div className="max-w-7xl mx-auto px-4py-12">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">Loading your formdata...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (idValid === false) {
    return (
      <>
        <Navbar />
        <div className="min-h-[93dvh] bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] pt-20 flex justify-center items-center">
          <div className="mx-auto px-4 py-12">
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Timetable Not Found</h3>
              <p className="mt-2 text-sm text-gray-500">The requested timetable ID doesn&apos;t exist.</p>
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
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto mt-[65px] min-h-[83dvh] p-6 space-y-6 max-xl:p-5 max-lg:p-4 max-md:p-3 max-sm:p-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold font-geistsans text-gray-800 max-2xl:text-3xl max-xl:text-3xl max-lg:text-2xl max-md:text-xl max-sm:text-lg">
              Timetable Form
            </h1>
            <h2 className="text-2xl font-semibold font-geistsans text-gray-600 max-xl:text-xl max-lg:text-lg max-md:text-base max-sm:text-sm">
              {activeSection}
            </h2>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 max-md:h-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full max-md:h-2"
              style={{ width: `${((currentIndex + 1) / sections.length) * 100}%` }}
            ></div>
          </div>

          {/* Section 1: Period Structure & Breaks */}
          {activeSection === "Period Structure & Breaks" && (
            <div className="p-4 border border-gray-300 rounded-lg shadow-md bg-white space-y-6">

              {/* Number of Periods */}
              <div className="grid grid-cols-1 max-md:grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label htmlFor="number-of-periods" className="block font-semibold text-gray-700">
                    Number of Periods on Weekdays
                  </label>
                  <Controller
                    name="periods"
                    control={control}
                    defaultValue=""
                    rules={{ required: true, min: 1, max: 8 }}
                    render={({ field }) => (
                      <input
                        id="number-of-periods"
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter a value between 1 and 8"
                        {...field}
                      />
                    )}
                  />
                  {errors.periods && (
                    <p className="text-red-500 text-sm">
                      {errors.periods.type === "required"
                        ? "This field is required."
                        : "Value must be between 1 and 8."}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label htmlFor="number-of-periods-on-saturday" className="block font-semibold text-gray-700">
                    Number of Periods on Saturday
                  </label>
                  <Controller
                    name="satPeriods"
                    control={control}
                    defaultValue=""
                    rules={{ required: true, min: 0, max: 8 }}
                    render={({ field }) => (
                      <input
                        id="number-of-periods-on-saturday"
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter 0 if Saturday is a holiday"
                        {...field}
                      />
                    )}
                  />
                  {errors.satPeriods && (
                    <p className="text-red-500 text-sm">
                      {errors.satPeriods.type === "required"
                        ? "This field is required."
                        : "Value must be between 0 and 8."}
                    </p>
                  )}
                </div>
              </div>

              {/* Breaks Configuration */}
              <div className="grid grid-cols-1 max-md:grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label htmlFor="short-break" className="block font-semibold text-gray-700">
                    Short Break After Which Period?
                  </label>
                  <Controller
                    name="shortBreak"
                    control={control}
                    defaultValue=""
                    rules={{ required: true, min: 1, max: 8 }}
                    render={({ field }) => (
                      <input
                        id="short-break"
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter a value between 1 and number of periods"
                        {...field}
                      />
                    )}
                  />
                  {errors.shortBreak && (
                    <p className="text-red-500 text-sm">
                      {errors.shortBreak.type === "required"
                        ? "This field is required."
                        : "Value must be between 1 and number of periods."}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label htmlFor="lunch-break" className="block font-semibold text-gray-700">
                    Lunch Break After Which Period?
                  </label>
                  <Controller
                    name="lunchBreak"
                    control={control}
                    defaultValue=""
                    rules={{ required: true, min: 1, max: 8 }}
                    render={({ field }) => (
                      <input
                        id="lunch-break"
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter a value between 1 and number of periods"
                        {...field}
                      />
                    )}
                  />
                  {errors.lunchBreak && (
                    <p className="text-red-500 text-sm">
                      {errors.lunchBreak.type === "required"
                        ? "This field is required."
                        : "Value must be between 1 and number of periods."}
                    </p>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-md">
                <p className="text-sm">
                  Please specify the <strong>short break</strong> and <strong>lunch break</strong> carefully to ensure they do not interfere with lab hours.
                </p>
              </div>

            </div>
          )}


          {/* Section 2: Number of Subjects & Labs */}
          {activeSection === "Number of Subjects" && (
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white space-y-4">
              {/* Number of Subjects */}
              <div className="space-y-3">
                <label
                  htmlFor="number-of-subjects"
                  className="block font-semibold text-gray-700"
                >
                  Number of Subjects
                </label>
                <Controller
                  name="numSubjects"
                  control={control}
                  defaultValue=""
                  rules={{ required: true, min: 1, max: 8 }}
                  render={({ field }) => (
                    <input
                      id="number-of-subjects"
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter a value between 1 and 8"
                      autoFocus
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const value = Number(e.target.value);
                        setSubs(value);
                      }}
                    />
                  )}
                />
                {errors.numSubjects && (
                  <p className="text-red-500 text-sm">
                    {errors.numSubjects.type === "required"
                      ? "This field is required."
                      : "Value must be between 1 and 8."}
                  </p>
                )}
              </div>

              {/* Number of Labs */}
              <div className="space-y-3">
                <label
                  htmlFor="number-of-labs"
                  className="block font-semibold text-gray-700"
                >
                  Number of Labs
                </label>
                <Controller
                  name="numLabs"
                  control={control}
                  defaultValue=""
                  rules={{ required: true, min: 0, max: 4 }}
                  render={({ field }) => (
                    <input
                      id="number-of-labs"
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter a value between 0 and 4"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        const value = Number(e.target.value);
                        setLabs(value);
                      }}
                    />
                  )}
                />
                {errors.numLabs && (
                  <p className="text-red-500 text-sm">
                    {errors.numLabs.type === "required"
                      ? "This field is required."
                      : "Value must be between 0 and 4."}
                  </p>
                )}
              </div>

              {/* Note about Lab Hours */}
              <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
                <p className="text-sm">
                  Each lab session will be allotted for <strong>2 hours</strong>.
                </p>
              </div>

            </div>
          )}

          {/* Section 3: Subject Names And Frequencies */}
          {activeSection === "Subject Names And Frequencies" && (
            <div className="space-y-6">
              {subjects.map((_, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6"
                >
                  {/* Subject Name Input */}
                  <div className="flex-1">
                    <label
                      htmlFor={`subject-${index}`}
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Subject {index + 1}
                    </label>
                    <Controller
                      name={`subjects[${index}]`}
                      control={control}
                      defaultValue=""
                      rules={{ required: "Subject name is required." }}
                      render={({ field }) => (
                        <input
                          id={`subject-${index}`}
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder={`Enter subject name...`}
                          {...field}
                        />
                      )}
                    />
                    {errors.subjects?.[index] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.subjects[index]?.message || "Invalid subject name."}
                      </p>
                    )}
                  </div>

                  {/* Frequency Input */}
                  <div className="w-full md:w-auto">
                    <label
                      htmlFor={`frequency-${index}`}
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Frequency
                    </label>
                    <Controller
                      name={`frequencies[${index}]`}
                      control={control}
                      defaultValue="1"
                      rules={{
                        required: "Frequency is required.",
                        min: { value: 1, message: "Frequency must be at least 1." },
                      }}
                      render={({ field }) => (
                        <input
                          id={`frequency-${index}`}
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          {...field}
                        />
                      )}
                    />
                    {errors.frequencies?.[index] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.frequencies[index]?.message || "Invalid frequency."}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 4: Lab Names And Frequencies */}
          {activeSection === "Lab Names And Frequencies" && (
            <div className="space-y-6">
              {labNames.map((_, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6"
                >
                  {/* Lab Name Input */}
                  <div className="flex-1">
                    <label
                      htmlFor={`lab-${index}`}
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Lab {index + 1}
                    </label>
                    <Controller
                      name={`labs[${index}]`}
                      control={control}
                      defaultValue=""
                      rules={{ required: "Lab name is required." }}
                      render={({ field }) => (
                        <input
                          id={`lab-${index}`}
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder={`Enter lab name...`}
                          {...field}
                        />
                      )}
                    />
                    {errors.labs?.[index] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.labs[index]?.message || "Invalid lab name."}
                      </p>
                    )}
                  </div>

                  {/* Frequency Input */}
                  <div className="w-full md:w-auto">
                    <label
                      htmlFor={`lab-frequency-${index}`}
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Frequency
                    </label>
                    <Controller
                      name={`labFrequencies[${index}]`}
                      control={control}
                      defaultValue="1"
                      rules={{
                        required: "Frequency is required.",
                        min: { value: 1, message: "Frequency must be at least 1." },
                      }}
                      render={({ field }) => (
                        <input
                          id={`lab-frequency-${index}`}
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          {...field}
                        />
                      )}
                    />
                    {errors.labFrequencies?.[index] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.labFrequencies[index]?.message || "Invalid frequency."}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 5: Teacher Names */}
          {activeSection === "Teacher Names" && (
            <div className="space-y-6">
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white"
                >
                  <label className="block font-semibold text-gray-700 mb-2">
                    Teacher for {subject || `Subject ${index + 1}`}
                  </label>
                  <Controller
                    name={`teachers[${index}]`}
                    control={control}
                    defaultValue=" "
                    render={({ field }) => (
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter teacher name..."
                        {...field}
                      />
                    )}
                  />
                </div>
              ))}
              {labNames.map((lab, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white"
                >
                  <label className="block font-semibold text-gray-700 mb-2">
                    Teacher for {lab || `Lab ${index + 1}`}
                  </label>
                  <Controller
                    name={`labTeachers[${index}]`}
                    control={control}
                    defaultValue=" "
                    render={({ field }) => (
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Enter teacher name..."
                        {...field}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Section 6: Teacher Unavailability */}
          {activeSection === "Teacher Unavailability" && (
            <div className="space-y-6">
              {[...teachers, ...labTeachers].map((teacher, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    Unavailability for {teacher || `Teacher ${index + 1}`}
                  </label>
                  <div className="grid grid-cols-6 gap-4">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (

                      <div key={day} className="col-span-1">
                        <p className="text-sm font-medium text-center text-gray-700 mb-2">
                          {day}
                        </p>
                        {Array.from(
                          { length: day === "Sat" ? getValues("satPeriods") || 0 : getValues("periods") || 1 },
                          (_, i) => i + 1
                        ).map((period) => {
                          const teacherKey = teacher;
                          const isAvailable =
                            teacherKey &&
                              teacherAvailability &&
                              teacherAvailability[`${teacherKey}-${day}-${period}`] !== undefined
                              ? teacherAvailability[`${teacherKey}-${day}-${period}`]
                              : false;
                          return (
                            <button
                              key={period}
                              type="button"
                              className={`w-full p-2 text-sm mb-2 font-medium rounded transition-all duration-200 ${isAvailable
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-red-500 text-white hover:bg-red-600"
                                }`}
                              onClick={() =>
                                toggleAvailability(teacherKey, day, period)
                              }
                            >
                              {(deviceWidth>550) ? "Period" : "P" } {period}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8 max-md:mt-6">
            <button
              type="button"
              className={`px-6 py-3 rounded-lg font-medium transition-all max-md:px-4 max-md:py-2 max-sm:text-sm ${currentIndex === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              Previous
            </button>

            {currentIndex === sections.length - 1 ? (
              <button
                type="button"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all max-md:px-4 max-md:py-2 max-sm:text-sm"
                onClick={handleSubmit(onSubmit)}
              >
                Generate Timetable
              </button>
            ) : (
              <button
                type="button"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all max-md:px-4 max-md:py-2 max-sm:text-sm"
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
