'use server';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '@/actions/db';
import storeUserLoginData from '@/actions/storeUserLoginData';
import { migrateLocalDataToDB } from '@/actions/migrateLocalData';
import bcrypt from 'bcrypt';
import getUserData from '@/actions/getUserData';

const saltRounds = 10;

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
                isSignUp: { label: 'Is Sign Up', type: 'hidden' }
            },
            async authorize(credentials) {
                try {
                    const isSignUp = credentials.isSignUp === 'true';

                    if (isSignUp) {
                        const checkResult = await query(`SELECT * FROM timetable_users WHERE email = $1`, [credentials.username]);
                        console.log(checkResult.rows);
                        if (checkResult.rowCount > 0) {
                            throw new Error('User already exists');
                        }
                        const hashedPassword = await bcrypt.hash(credentials.password, saltRounds);
                        console.log("hi")
                        await query(`INSERT INTO timetable_users(email, password) VALUES($1, $2)`, [credentials.username, hashedPassword]);
                        const result = await getUserData(credentials.username);
                        // console.log(result);
                        return {
                            id: result.id,
                            email: result.email,
                            isNewUser: true
                        };
                    } else {
                        const result = await query(`SELECT * FROM timetable_users WHERE email = $1`, [credentials.username]);
                        console.log(result.rows);
                        const user = result.rows[0];
                        if (!user) {
                            throw new Error('User not found !!');
                        }
                        const isValid = await bcrypt.compare(credentials.password, user.password);
                        if (!isValid) {
                            throw new Error('Incorrect Password !!');
                        }
                        return { id: user.id, email: user.email, isNewUser: false };
                    }

                }
                catch (error) {
                    console.log(error);
                    throw new Error(error.message || 'An error occurred');
                }
            },
        })
    ],
    callbacks: {
        async signIn(user, account) {
            try {
                console.log("hi")

                if (account?.provider === 'google') {
                    user.password = 'google';
                }

                if (user.isNewUser) {
                    await storeUserLoginData(user);
                }
                await migrateLocalDataToDB(user.email);
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        },
        async session({ session }) {
            try {
                if (session.user && session.user.email) {
                    const result = await query(`SELECT * FROM timetable_users WHERE email = $1`, [session.user.email]);
                    const user = result.rows[0];
                    session.user.id = user.id;
                    session.user.email = user.email;
                }
                return session;
            } catch (error) {
                console.error(error);
                return session;
            }
        },
    },
});

export { handler as GET, handler as POST };