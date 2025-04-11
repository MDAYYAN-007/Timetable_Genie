'use server';
import { query } from '@/actions/db';

const deleteTimetable = async (id,userId) => {
    try {
        await query(`DELETE FROM timetables WHERE timetable_id = $1 AND user_id = $2`, [id, userId]);
        return true;
    } catch (error) {
        console.error(error);
    }
}

export default deleteTimetable;