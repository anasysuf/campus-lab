import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/bookings/[id] - Approve, Reject, Cancel
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, adminNote } = body; // action: 'APPROVE' | 'REJECT' | 'CANCEL'

    const booking = await prisma.roomBooking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Data pemesanan lab tidak ditemukan.' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = session.user.id === booking.userId;

    if (action === 'CANCEL') {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Tidak memiliki hak akses untuk membatalkan.' }, { status: 403 });
      }

      const updated = await prisma.roomBooking.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
          adminNote: adminNote || 'Dibatalkan oleh pemesan.',
        },
      });

      return NextResponse.json(updated);
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Hanya Admin yang dapat menyetujui atau menolak jadwal.' }, { status: 403 });
    }

    if (action === 'APPROVE') {
      const updated = await prisma.roomBooking.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          adminNote: adminNote || 'Pemesanan ruangan disetujui.',
        },
      });
      return NextResponse.json(updated);
    }

    if (action === 'REJECT') {
      const updated = await prisma.roomBooking.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          adminNote: adminNote || 'Pemesanan ruangan ditolak karena jadwal bentrok/ruang tidak dapat digunakan.',
        },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update booking:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status reservasi' }, { status: 500 });
  }
}

// DELETE /api/bookings/[id] - Delete booking (Admin or Owner)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.roomBooking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }

    if (session.user.role !== 'ADMIN' && session.user.id !== booking.userId) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    await prisma.roomBooking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Jadwal berhasil dihapus.' });
  } catch (error) {
    console.error('Failed to delete booking:', error);
    return NextResponse.json({ error: 'Gagal menghapus jadwal' }, { status: 500 });
  }
}
