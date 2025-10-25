import NextAuth from "next-auth";
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import postgres from "postgres";

// ===============================================
// TODO
const postgresUrl = 'localhost:15432';
console.log(`Connecting to... ${postgresUrl}`);

const sql = postgres({
    host: 'localhost',
    port: 15432,
    password: 'password',
    db: 'nextjs-dashboard-postgres',
    username: 'postgres'
});
// ===============================================

async function getUser(email: string) {
    try {
        const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
        return user[0];
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [Credentials({
        authorize: async(credentials) => {
            const parsedCredentials = z.object(
                {
                    email: z.string().email(),
                    password: z.string().min(6)
                }
            ).safeParse(credentials)
            
            if (parsedCredentials.success) {
                const { email, password } = parsedCredentials.data;
                const user = await getUser(email);

                if (!user) return null;

                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (passwordsMatch) return user;
            }

            return null;
        }
    })],
});
