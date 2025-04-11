'use server';
import { query } from "@/actions/db";

const deleteExistingTimetables = async (id,userId) => {

    // Delete from database for authenticated users
    try {
        await query('DELETE FROM generated_timetables WHERE formdata_id = $1 AND user_id = $2', [id, userId]);
        // console.log('Deleted existing timetables from database');
    } catch (error) {
        console.error('Error deleting timetables from database:', error);
    }
};

export default deleteExistingTimetables;