import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get details of single user including loan and booking history
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
        loans: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            equipment: {
              select: { name: true, code: true, category: true, imageUrl: true },
            },
          },
        },
        bookings: {
          take: 10,
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to get user details:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail pengguna' }, { status: 500 });
  }
}

// PATCH /api/users/[id] - Admin updates user info or role
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, role, nim, department, phone, avatar, ktmImage, newPassword } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (role !== undefined) data.role = role;
    if (nim !== undefined) data.nim = nim;
    if (department !== undefined) data.department = department;
    if (phone !== undefined) data.phone = phone;
    if (avatar !== undefined) data.avatar = avatar;
    if (ktmImage !== undefined) data.ktmImage = ktmImage;

    // Note: newPassword update is disabled in demo mode

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data,
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

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data pengguna' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Admin deletes user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif.' }, { status: 400 });
    }

    // Check active loans
    const activeLoans = await prisma.loanTransaction.count({
      where: {
        userId: params.id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (activeLoans > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus mahasiswa yang memiliki peminjaman aktif atau pending.' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Akun pengguna berhasil dihapus.' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengguna' }, { status: 500 });
  }
}
