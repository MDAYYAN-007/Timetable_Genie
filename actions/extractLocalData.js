"use client";

const extractLocalData = () => {
  try {
    const formData = JSON.parse(localStorage.getItem("formData") || "[]");
    const timetables = JSON.parse(localStorage.getItem("timetables") || "[]");
    const generatedTimetables = JSON.parse(localStorage.getItem("generatedtimetables") || "[]");

    return { formData, timetables, generatedTimetables };
  } catch (err) {
    console.error("Error extracting local data:", err);
    return { formData: [], timetables: [], generatedTimetables: [] };
  }
};

export default extractLocalData;