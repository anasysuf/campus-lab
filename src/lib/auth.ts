import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase().trim(),
          },
        });

        if (!user) {
          throw new Error('Akun tidak ditemukan');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Password tidak cocok');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          nim: user.nim,
          department: user.department,
          phone: user.phone,
          avatar: user.avatar,
          ktmImage: user.ktmImage,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.nim = user.nim;
        token.department = user.department;
        token.phone = user.phone;
        token.avatar = user.avatar;
        token.ktmImage = user.ktmImage;
      }
      if (trigger === 'update' && session) {
        token.name = session.name || token.name;
        token.avatar = session.avatar || token.avatar;
        token.phone = session.phone !== undefined ? session.phone : token.phone;
        token.department = session.department !== undefined ? session.department : token.department;
        token.ktmImage = session.ktmImage !== undefined ? session.ktmImage : token.ktmImage;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.nim = token.nim as string | undefined;
        session.user.department = token.department as string | undefined;
        session.user.phone = token.phone as string | undefined;
        session.user.avatar = token.avatar as string | undefined;
        session.user.ktmImage = token.ktmImage as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-campus-lab-key-2026',
};
