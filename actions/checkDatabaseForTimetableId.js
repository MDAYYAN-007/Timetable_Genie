'use server';
import { query } from "./db";

const checkDatabaseForTimetableId = async (timetableId) => {    
    try {
        const result = await query(`
            SELECT EXISTS (
                SELECT 1
                FROM timetables
                WHERE id = $1
            ) AS exists
        `, [timetableId]);

        return result.rows[0].exists;
    } catch (error) {
        console.error("Error checking timetable ID:", error);
        throw error;
    }
}

export default checkDatabaseForTimetableId;