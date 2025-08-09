'use server';
import { query } from "./db";

const checkDatabaseForTimetableId = async (timetableId, userId) => {
    try {
        const result = await query(`
            SELECT EXISTS (
                SELECT 1
                FROM timetables
                WHERE timetable_id = $1 AND user_id = $2
            ) AS exists
        `, [timetableId, userId]);

        console.log('Checking timetable ID:', timetableId, 'for user:', userId);
        console.log('Query result:', result.rows[0].exists);

        return result.rows[0].exists;
    } catch (error) {
        console.error("Error checking timetable ID:", error);
        throw error;
    }
}

export default checkDatabaseForTimetableId;