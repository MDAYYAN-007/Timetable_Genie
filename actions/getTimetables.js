'use server'
import { query } from '@/actions/db';

const getTimetables = async (email) => {
    try {
        const result = await query(`SELECT * FROM timetable_users WHERE email = $1`, [email]);
        const id = result.rows[0].id;
        const timetables = await query(`SELECT * FROM timetables WHERE user_id = $1`, [id]); 
        return timetables.rows;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default getTimetables;