'use server';
import { query } from '@/actions/db';

const getUserData = async (email) => {
    try {
        const result = await query(`SELECT * FROM timetable_users WHERE email = $1`, [email]);
        return result.rows[0];
    } catch (error) {
        console.error(error);
    }
}

export default getUserData;