"use server"
import { query } from './db';

const storeUserLoginData = async (user) => {
    try {

        console.log('Storing user data:', user);
        await query(`
            CREATE TABLE IF NOT EXISTS timetable_users(
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);

        const checkResult = await query(`SELECT * FROM timetable_users WHERE email = $1`, [user.email]);

        if (checkResult.rowCount > 0) {
            console.log('User already exists');
            return { success: false, message: 'User already exists' };
        }
        else {
            await query(
                `INSERT INTO timetable_users(email, password) VALUES($1, $2)`,
                [user.email, user.password]
            );
            console.log('User data stored successfully');
        }

    } catch (error) {
        console.log('Error storing user data:', error);
    }

};

export default storeUserLoginData;