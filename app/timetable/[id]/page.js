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

const Timetable = () => {

  const { data: session } = useSession();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [timetables, setTimetables] = useState([]);

  const id = params.id;

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        if (session) {
          const result = await getGeneratedTimetables(id);
          if (result && result.length > 0) {
            setTimetables(result);
          } else {
            const formData = await getFormData(id);
            console.log("Form Data:", formData);
            const timetable = await generateTimetable(formData);
            console.log("Generated Timetable:", timetable);
            await storeGeneratedTimetables(timetable, id);
            setTimetables([timetable]);
          }
        } else {
          const storedTimetables = JSON.parse(localStorage.getItem('generatedtimetables')) || [];
          const matchingTimetable = storedTimetables.find(item => item.id === id);
          // console.log("Matching Timetable:", matchingTimetable);

          if (matchingTimetable) {
            setTimetables([matchingTimetable.timetable]);
            // console.log("Timetable found in localStorage:", matchingTimetable.timetable);
          } else {
            const formDataString = localStorage.getItem('formData');
            // console.log("Form Data String:", formDataString);

            if (formDataString) {
              const formDataArray = JSON.parse(formDataString);
              // console.log("Form Data Array:", formDataArray);
              const formData = formDataArray.find(item => item.id === id);
              // console.log("Form Data:", formData);

              if (formData) {
                const timetable = await generateTimetable(formData.data);
                // console.log("Generated Timetable:", timetable);

                const updatedTimetables = storedTimetables.filter(item => item.id !== id);
                updatedTimetables.push({ id, timetable });
                localStorage.setItem('generatedtimetables', JSON.stringify(updatedTimetables));

                setTimetables([timetable]);
              } else {
                console.warn(`No matching form data found for id: ${id}`);
              }
            } else {
              console.warn("No form data found in localStorage.");
            }
          }
        }

      } catch (error) {
        console.error("Error fetching timetable:", error);
      }
    };

    fetchTimetables();
  }, [id, session]);


  return (
    <>
      <Navbar />
      <div className="mt-12 flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
        
      </div>
      <Footer />
    </>
  );
};

export default Timetable;
