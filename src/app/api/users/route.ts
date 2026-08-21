import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { isValidEmail, isValidImageUrl, isValidRole, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

// GET /api/users - Admin list of all users with search, role, & metrics
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Administrator.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = sanitizeString(searchParams.get('search') || '', 100);
    const role = searchParams.get('role') || '';
    const department = searchParams.get('department') || '';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { nim: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'ALL' && isValidRole(role)) {
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
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password minimal harus 6 karakter.' }, { status: 400 });
    }

    const cleanRole = isValidRole(role) ? role : 'STUDENT';
    const cleanName = sanitizeString(name, 100);
    const cleanNim = nim ? sanitizeString(nim, 30) : null;
    const cleanDepartment = department ? sanitizeString(department, 100) : null;
    const cleanPhone = phone ? sanitizeString(phone, 25) : null;

    let cleanAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;
    if (avatar && isValidImageUrl(avatar)) {
      cleanAvatar = avatar;
    }

    let cleanKtmImage: string | null = null;
    if (ktmImage && isValidImageUrl(ktmImage)) {
      cleanKtmImage = ktmImage;
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: cleanRole,
        nim: cleanNim,
        department: cleanDepartment,
        phone: cleanPhone,
        avatar: cleanAvatar,
        ktmImage: cleanKtmImage,
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
