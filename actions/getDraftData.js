'use server';
import { query } from '@/actions/db';

const getDraftData = async (id) => {
    try {
        const result = await query(
            `SELECT * FROM draft_timetables WHERE id = $1`,
            [id]
        );
        if (result.rowCount > 0) {
            return result.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.log("Database error:", error);
        return null;
    }
}

export default getDraftData;