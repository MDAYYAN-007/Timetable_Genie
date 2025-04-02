'use server';
import { query } from "@/actions/db";

const getGeneratedTimetables = async (id) => {
    try {
        const result = await query(`SELECT timetable_id, generated_timetable, tt_no FROM generated_timetables WHERE timetable_id = $1`, [id]);

        if (!result.rows.length) {
            return { success: false, message: "No generated timetables found", data: [] };
        }

        return {
            success: true, data: result.rows.map(row => ({
                id: row.timetable_id,
                timetable: row.generated_timetable,
                tt_no: row.tt_no
            }))
        };

    } catch (error) {
        console.error('Error getting generated timetables:', error);
        return { success: false, message: 'Failed to get generated timetables', error };
    }
}

export default getGeneratedTimetables;
