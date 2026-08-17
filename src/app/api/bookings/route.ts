import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/bookings - get lab bookings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('roomName');
    const status = searchParams.get('status');
    const date = searchParams.get('date'); // YYYY-MM-DD
    const myOnly = searchParams.get('myOnly') === 'true';

    const session = await getServerSession(authOptions);

    const where: any = {};

    if (myOnly && session?.user) {
      where.userId = session.user.id;
    }

    if (roomName && roomName !== 'ALL') {
      where.roomName = { contains: roomName, mode: 'insensitive' };
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const bookings = await prisma.roomBooking.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nim: true,
            department: true,
            phone: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json({ error: 'Gagal mengambil data jadwal pemesanan lab' }, { status: 500 });
  }
}

// POST /api/bookings - create a lab room booking
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Silakan login.' }, { status: 401 });
    }

    const body = await request.json();
    const { roomName, startTime, endTime, purpose, isMaintenance = false } = body;

    if (!roomName || !startTime || !endTime || !purpose) {
      return NextResponse.json(
        { error: 'Nama lab, waktu mulai, waktu selesai, dan keperluan wajib diisi.' },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Format waktu tidak valid.' }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json({ error: 'Waktu selesai harus setelah waktu mulai.' }, { status: 400 });
    }

    // Check for overlapping APPROVED bookings for the same room
    const conflict = await prisma.roomBooking.findFirst({
      where: {
        roomName,
        status: 'APPROVED',
        OR: [
          {
            startTime: { lte: start },
            endTime: { gt: start },
          },
          {
            startTime: { lt: end },
            endTime: { gte: end },
          },
          {
            startTime: { gte: start },
            endTime: { lte: end },
          },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        {
          error: `Ruangan "${roomName}" sudah dipesan pada rentang waktu tersebut (${new Date(conflict.startTime).toLocaleTimeString('id-ID')} - ${new Date(conflict.endTime).toLocaleTimeString('id-ID')}).`,
        },
        { status: 409 }
      );
    }

    const isAdmin = session.user.role === 'ADMIN';

    const newBooking = await prisma.roomBooking.create({
      data: {
        userId: session.user.id,
        roomName,
        startTime: start,
        endTime: end,
        purpose: purpose.trim(),
        isMaintenance: isAdmin ? Boolean(isMaintenance) : false,
        // Admins creating maintenance or booking are automatically approved
        status: isAdmin ? 'APPROVED' : 'PENDING',
        adminNote: isAdmin ? 'Dijadwalkan langsung oleh Pengelola Lab.' : null,
      },
      include: {
        user: {
          select: { id: true, name: true, nim: true, department: true },
        },
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json({ error: 'Gagal membuat reservasi lab' }, { status: 500 });
  }
}
