'use server';
import { query } from "@/actions/db";

const storeGeneratedTimetables = async (timetable, id) => {
    try {
        const jsonTimetable = JSON.stringify(timetable);

        await query(
            `INSERT INTO generated_timetables(generated_timetable, timetable_id) VALUES($1, $2)`, 
            [jsonTimetable, id]
        );

        return { success: true, message: "Generated timetable stored successfully" };
    } catch (error) {
        console.error("Database error:", error);
        return { success: false, message: "Failed to store generated timetable", error };
    }
};

export default storeGeneratedTimetables;