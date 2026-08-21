import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidImageUrl, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

// GET /api/profile - Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json({ error: 'Gagal mengambil data profil' }, { status: 500 });
  }
}

// PATCH /api/profile - Update own profile
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, department, avatar, ktmImage, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const updateData: any = {};

    if (name) updateData.name = sanitizeString(name, 100);
    if (phone !== undefined) updateData.phone = phone ? sanitizeString(phone, 25) : null;
    if (department !== undefined) updateData.department = department ? sanitizeString(department, 100) : null;

    if (avatar !== undefined) {
      if (avatar && isValidImageUrl(avatar)) {
        updateData.avatar = avatar;
      } else if (!avatar) {
        updateData.avatar = null;
      }
    }

    if (ktmImage !== undefined) {
      if (ktmImage && isValidImageUrl(ktmImage)) {
        updateData.ktmImage = ktmImage;
      } else if (!ktmImage) {
        updateData.ktmImage = null;
      }
    }

    // Password change is temporarily disabled in demo mode
    if (newPassword) {
      return NextResponse.json(
        { error: 'Fitur ganti password dinonaktifkan sementara untuk keperluan demo publik.' },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
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

    return NextResponse.json({
      message: 'Profil akun pribadi berhasil diperbarui!',
      user: updated,
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Gagal memperbarui profil.' }, { status: 500 });
  }
}
