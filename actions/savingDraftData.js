'use server';
import { query } from '@/actions/db';

const savingDraftData = async (timetables, formData, generated_timetables, id) => {
    console.log("Timetables", timetables)
    console.log("Form Data", formData)
    console.log("Generated Timetables", generated_timetables)
    console.log("ID", id)

    try {
        //Creating table if not exists
        await query(
            `CREATE TABLE IF NOT EXISTS draft_timetables (
            id UUID PRIMARY KEY,
            form_data JSONB,
            timetables JSONB,
            generated_timetables JSONB
        );`
        );

        // Inserting data into the table
        await query(
            `INSERT INTO draft_timetables (id, form_data, timetables, generated_timetables) 
             VALUES ($1, $2, $3, $4)`,
            [
                id,
                JSON.stringify(formData),
                JSON.stringify(timetables),
                JSON.stringify(generated_timetables)
            ]
        );

        // //Checking if the data is inserted or not
        // const result = await query(
        //     `SELECT * FROM draft_timetables WHERE id = $1`,
        //     [id]
        // );
        // if (result.rowCount > 0) {
        //     console.log("Draft data saved successfully:", result.rows[0]);
        // } else {
        //     console.log("Draft data not found");
        // }
        return true;
    } catch (error) {
        console.error(error)
    }


}

export default savingDraftData;