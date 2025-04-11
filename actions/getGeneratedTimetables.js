'use server';
import { query } from "@/actions/db";

const getGeneratedTimetables = async (id, usedId) => {
    try {
        const result = await query(`SELECT formdata_id, generated_timetable, tt_no FROM generated_timetables WHERE formdata_id = $1 AND user_id = $2`, [id, usedId]);

        if (!result.rows.length) {
            return { success: false, message: "No generated timetables found", data: [] };
        }

        return {
            success: true, data: result.rows.map(row => ({
                id: row.formdata_id,
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
