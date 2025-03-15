'use server';
import { query } from '@/actions/db';

const storeTimeTable = async (id,name,user_id) => {
    try{
        // await query(`
        //     CREATE TABLE IF NOT EXISTS timetables(
        //         id BIGINT PRIMARY KEY,
        //         name VARCHAR(255) NOT NULL,
        //         user_id INTEGER NOT NULL,
        //         FOREIGN KEY(user_id) REFERENCES timetable_users(id) ON DELETE CASCADE
        //     )
        // `);

        await query(
            `INSERT INTO timetables(id,name,user_id) VALUES($1,$2,$3)`,
            [id,name,user_id]
        );
    }catch(error){
        console.error(error);
    }
}

export default storeTimeTable;
