import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb } from './mongo';
import { ObjectId } from 'mongodb';
import { authConfig } from './auth.config';

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? '').toLowerCase().trim();
        const password = String(creds?.password ?? '');
        if (!email || !password) return null;
        const db = await getDb();
        const user = await db.collection('users').findOne({ email });
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: (user._id as ObjectId).toString(), email: user.email };
      },
    }),
  ],
});
