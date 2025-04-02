'use server';
import { query } from "@/actions/db";

const deleteExistingTimetables = async (id) => {

    // Delete from database for authenticated users
    try {
        await query('DELETE FROM generated_timetables WHERE timetable_id = $1', [id]);
        console.log('Deleted existing timetables from database');
    } catch (error) {
        console.error('Error deleting timetables from database:', error);
    }
};

export default deleteExistingTimetables;