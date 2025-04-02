'use server';
import { query } from '@/actions/db';

const renameTimetable = async (timetableName, editingTimetableId) => {
    try {
        await query(`UPDATE timetables SET name = $1 WHERE id = $2`, [timetableName, editingTimetableId]);
        return true;
    } catch (error) {
        console.error(error);
    }
}

export default renameTimetable;