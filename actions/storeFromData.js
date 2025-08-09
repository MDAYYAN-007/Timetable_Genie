'use server';
import { query } from '@/actions/db';

const storeFormData = async (id, formData, userId) => {
    try {
    
         await query(`
            CREATE TABLE IF NOT EXISTS timetable_formdata (
                id SERIAL PRIMARY KEY,
                formdata_id BIGINT,
                formData JSONB NOT NULL,
                user_id INTEGER NOT NULL,
                FOREIGN KEY(user_id) REFERENCES timetable_users(id) ON DELETE CASCADE
            );`);
        
        const jsonData = JSON.stringify(formData);

        const existing = await query(`SELECT id FROM timetable_formdata WHERE formdata_id = $1 AND user_id = $2`, [id, userId]);

        let result;
        if (existing.rows.length > 0) {
            result = await query(`UPDATE timetable_formdata SET formData = $1 WHERE formdata_id = $2 AND user_id = $3`, [jsonData, id, userId]);
        } else {
            result = await query(`INSERT INTO timetable_formdata (formdata_id, formData, user_id) VALUES ($1, $2, $3)`, [id, jsonData, userId]);
        }

        return { success: true, message: "Data inserted or updated successfully", rowCount: result.rowCount };
    } catch (error) {
        console.error('Error storing form data:', error);
        return { success: false, message: 'Failed to store form data', error };
    }
};

export default storeFormData;
