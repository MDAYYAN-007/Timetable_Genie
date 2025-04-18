'use server';
import { query } from '@/actions/db';

const getFormData = async (id, user_id) => {
    try {
        const result = await query(`SELECT formData FROM timetable_formdata WHERE formdata_id = $1 AND user_id = $2`, [id, user_id]);
        // console.log('Result:', result);

        if (result.rows.length > 0) {
            const formData = result.rows[0].formdata;
            // console.log('Form Data:', formData);
            return { success: true, data: formData };
        } else {
            return { success: false, message: 'No form data found' };
        }
    } catch (error) {
        console.log('Error getting form data:', error);
        return { success: false, message: 'Failed to get form data', error };
    }
};

export default getFormData;
