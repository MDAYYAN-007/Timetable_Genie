'use server';
import { query } from '@/actions/db';

const deleteTimetable = async (id) => {
    try {
        await query(`DELETE FROM timetables WHERE id = $1`, [id]);
        return true;
    } catch (error) {
        console.error(error);
    }
}

export default deleteTimetable;