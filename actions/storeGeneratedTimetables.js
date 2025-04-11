'use server';
import { query } from "@/actions/db";

const storeGeneratedTimetables = async (timetable, id, tt_no, usedId) => {
    try {
        const jsonTimetable = JSON.stringify(timetable);

        //Deleting table if exists
        // await query(`DROP TABLE IF EXISTS generated_timetables`);

        //Creating table if not exists
        await query(`
            CREATE TABLE IF NOT EXISTS generated_timetables (
                id SERIAL PRIMARY KEY,
                generated_timetable JSONB NOT NULL,
                formdata_id BIGINT NOT NULL,
                tt_no INT NOT NULL, 
                user_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES timetable_users(id) ON DELETE CASCADE
            );`
        );

        // Check if a timetable with this tt_no already exists
        const existing = await query(
            `SELECT * FROM generated_timetables 
             WHERE formdata_id = $1 AND tt_no = $2 AND user_id = $3`,
            [id, tt_no, usedId]
        );

        if (existing.rows.length > 0) {
            // Update existing record
            await query(
                `UPDATE generated_timetables 
                 SET generated_timetable = $1
                 WHERE formdata_id = $2 AND tt_no = $3 AND user_id = $4`,
                [jsonTimetable, id, tt_no, usedId]
            );

            return {
                success: true,
                message: "Generated timetable updated successfully"
            };

        } else {
            // Insert new record
            await query(
                `INSERT INTO generated_timetables(
                    generated_timetable, 
                    formdata_id,
                    tt_no,
                    user_id
                ) VALUES($1, $2, $3, $4)`,
                [jsonTimetable, id, tt_no, usedId]
            );
            return {
                success: true,
                message: "Generated timetable stored successfully"
            };
        }
    } catch (error) {
        console.error("Database error:", error);
        return {
            success: false,
            message: "Failed to store generated timetable",
            error
        };
    }
};

export default storeGeneratedTimetables;