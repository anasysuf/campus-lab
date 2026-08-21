import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, isValidEmail, isValidImageUrl, sanitizeString } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`register_${ip}`, 10, 60000); // 10 attempts per minute per IP
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan registrasi. Silakan coba beberapa saat lagi.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password, nim, department, phone, ktmImage } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal harus 6 karakter.' },
        { status: 400 }
      );
    }

    if (password.length > 100) {
      return NextResponse.json(
        { error: 'Password terlalu panjang (maksimal 100 karakter).' },
        { status: 400 }
      );
    }

    const cleanName = sanitizeString(name, 100);
    const cleanNim = nim ? sanitizeString(nim, 30) : null;
    const cleanDepartment = department ? sanitizeString(department, 100) : 'Teknik & Sains Terapan';
    const cleanPhone = phone ? sanitizeString(phone, 25) : null;

    let cleanKtmImage: string | null = null;
    if (ktmImage && typeof ktmImage === 'string' && isValidImageUrl(ktmImage)) {
      cleanKtmImage = ktmImage.length < 1000000 ? ktmImage : null;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: 'STUDENT', // Force STUDENT role to prevent privilege escalation
        nim: cleanNim,
        department: cleanDepartment,
        phone: cleanPhone,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
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

    return NextResponse.json(
      { message: 'Registrasi akun berhasil! Silakan login.', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat registrasi.' },
      { status: 500 }
    );
  }
}
