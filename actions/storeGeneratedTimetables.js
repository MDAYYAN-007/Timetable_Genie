'use server';
import { query } from "@/actions/db";

const storeGeneratedTimetables = async (timetable, id, tt_no) => {
    try {
        const jsonTimetable = JSON.stringify(timetable);

//         await query(`DROP TABLE IF EXISTS generated_timetables`);

//         await query(`
//     CREATE TABLE generated_timetables (
//         id SERIAL PRIMARY KEY,
//         generated_timetable JSONB NOT NULL,
//         timetable_id BIGINT NOT NULL,
//         tt_no INT NOT NULL, 
//         FOREIGN KEY (timetable_id) REFERENCES timetable_formdata(id) ON DELETE CASCADE
//     )
// `);


        // Check if a timetable with this tt_no already exists
        const existing = await query(
            `SELECT * FROM generated_timetables 
             WHERE timetable_id = $1 AND tt_no = $2`,
            [id, tt_no]
        );

        if (existing.rows.length > 0) {
            // Update existing record
            await query(
                `UPDATE generated_timetables 
                 SET generated_timetable = $1
                 WHERE timetable_id = $2 AND tt_no = $3`,
                [jsonTimetable, id, tt_no]
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
                    timetable_id,
                    tt_no
                ) VALUES($1, $2, $3)`,
                [jsonTimetable, id, tt_no]
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