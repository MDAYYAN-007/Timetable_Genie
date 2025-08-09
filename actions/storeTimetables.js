'use server';
import { query } from '@/actions/db';

const storeTimeTable = async (id, name, user_id) => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS timetables(
                id SERIAL PRIMARY KEY,
                timetable_id BIGINT,
                name VARCHAR(255) NOT NULL,
                user_id INTEGER NOT NULL,
                FOREIGN KEY(user_id) REFERENCES timetable_users(id) ON DELETE CASCADE
            )
        `);

        const existingTable = await query(`
            SELECT * FROM timetables WHERE timetable_id = $1 AND user_id = $2
        `, [id, user_id]);

        console.log(existingTable.rowCount);

        if (existingTable.rowCount > 0) {
            await query(`
                UPDATE timetables SET name = $1 WHERE timetable_id = $2
            `, [name, id]);
            return;
        }
        
        await query(
            `INSERT INTO timetables(timetable_id,name,user_id) VALUES($1,$2,$3)`,
            [id, name, user_id]
        );
    } catch (error) {
        console.error(error);
    }
}

export default storeTimeTable;
