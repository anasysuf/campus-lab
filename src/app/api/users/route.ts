import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET /api/users - Admin list of all users with search, role, & metrics
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Administrator.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const department = searchParams.get('department') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { nim: { contains: search } },
        { phone: { contains: search } },
        { department: { contains: search } },
      ];
    }

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (department && department !== 'ALL') {
      where.department = department;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nim: true,
        department: true,
        phone: true,
        avatar: true,
        ktmImage: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            loans: true,
            bookings: true,
          },
        },
      },
    });

    const departments = await prisma.user.findMany({
      where: { department: { not: null } },
      select: { department: true },
      distinct: ['department'],
    });

    return NextResponse.json({
      users,
      departments: departments.map((d) => d.department).filter(Boolean),
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Gagal mengambil data akun pengguna' }, { status: 500 });
  }
}

// POST /api/users - Admin create new user manually
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role = 'STUDENT', nim, department, phone, avatar, ktmImage } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
        role,
        nim: nim || null,
        department: department || null,
        phone: phone || null,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        ktmImage: ktmImage || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nim: true,
        department: true,
        phone: true,
        avatar: true,
        ktmImage: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Gagal menambahkan akun pengguna' }, { status: 500 });
  }
}
