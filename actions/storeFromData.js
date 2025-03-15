'use server';
import { query } from '@/actions/db';

const storeFormData = async (id, formData) => {
    try {

         // await query(
        //     CREATE TABLE IF NOT EXISTS timetable_formdata (
        //         id BIGINT PRIMARY KEY,
        //         formData JSONB NOT NULL,
        //         FOREIGN KEY(id) REFERENCES timetables(id) ON DELETE CASCADE
        //     );
        // )
        
        const jsonData = JSON.stringify(formData);

        const existing = await query(`SELECT id FROM timetable_formdata WHERE id = $1`, [id]);

        let result;
        if (existing.rows.length > 0) {
            result = await query(`UPDATE timetable_formdata SET formData = $1 WHERE id = $2`, [jsonData, id]);
        } else {
            result = await query(`INSERT INTO timetable_formdata (id, formData) VALUES ($1, $2)`, [id, jsonData]);
        }

        return { success: true, message: "Data inserted or updated successfully", rowCount: result.rowCount };
    } catch (error) {
        console.error('Error storing form data:', error);
        return { success: false, message: 'Failed to store form data', error };
    }
};

export default storeFormData;
