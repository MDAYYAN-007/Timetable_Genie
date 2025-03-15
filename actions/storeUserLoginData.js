"use server"
import bcrypt from 'bcrypt';
import { query } from './db';

const saltRounds = 10;

const storeUserLoginData = async (user) => {
    try {
        // await query(`
        //     CREATE TABLE IF NOT EXIST timetable_users(
        //         id SERIAL PRIMARY KEY,
        //         email VARCHAR(255) UNIQUE NOT NULL,
        //         password TEXT NOT NULL
        //     )
        // `);

        const checkResult = query(`SELECT * FROM timetable_users WHERE email = $1`, user.email);

        if (checkResult.rowCount > 0) {
            console.log('User already exists');
            return;
        } else {
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            await query(
                `INSERT INTO timetable_users(email, password) VALUES($1, $2)`,
                [user.email, hashedPassword]
            )
        }

    } catch (error) {

    }

};

export default storeUserLoginData;