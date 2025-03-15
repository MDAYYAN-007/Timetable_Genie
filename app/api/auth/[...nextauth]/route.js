'use server';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '@/actions/db';
import storeUserLoginData from '@/actions/storeUserLoginData';

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
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                try {
                    const result = await query(`SELECT * FROM timetable_users WHERE email = $1`, credentials.username);
                    const user = result.rows[0];

                    if (!user) {
                        throw new Error('No user found');
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) {
                        throw new Error('Password incorrect');
                    }

                    return { id: user.id, email: user.email };

                }
                catch (error) {
                    throw new Error('Authentication failed');
                }
            },
        })
    ],
    callbacks: {
        async signIn(user, account) {
            try{
                const loginProvider = account.provider;

                if (loginProvider === 'google') {
                    user.password = 'google';
                }
                await storeUserLoginData(user);
                return true;
            }catch(error){
                console.error(error);
                return false;
            }
        },
        async session({ session }) {
            try {
                if (session.user && session.user.email) {
                    const result = await query(`SELECT * FROM timetable_users WHERE email = $1`, session.user.email);
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