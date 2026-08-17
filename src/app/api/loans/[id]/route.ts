import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/loans/[id] - Update status (Approve, Reject, Return, Cancel)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Silakan login.' }, { status: 401 });
    }

    const body = await request.json();
    const { action, adminNote } = body; // action: 'APPROVE' | 'REJECT' | 'RETURN' | 'CANCEL'

    const loan = await prisma.loanTransaction.findUnique({
      where: { id: params.id },
      include: { equipment: true },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Data peminjaman tidak ditemukan' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = session.user.id === loan.userId;

    if (action === 'CANCEL') {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Anda tidak memiliki hak untuk membatalkan pengajuan ini.' }, { status: 403 });
      }
      if (loan.status !== 'PENDING') {
        return NextResponse.json({ error: 'Hanya pengajuan berstatus PENDING yang dapat dibatalkan.' }, { status: 400 });
      }

      const updated = await prisma.loanTransaction.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          adminNote: adminNote || 'Dibatalkan oleh peminjam.',
        },
      });

      return NextResponse.json(updated);
    }

    // All actions below require ADMIN
    if (!isAdmin) {
      return NextResponse.json({ error: 'Akses ditolak. Tindakan ini khusus Admin Laboratorium.' }, { status: 403 });
    }

    if (action === 'APPROVE') {
      if (loan.status !== 'PENDING') {
        return NextResponse.json({ error: `Pengajuan tidak bisa disetujui karena status saat ini: ${loan.status}` }, { status: 400 });
      }

      // Check stock
      if (loan.equipment.availableQuantity < loan.quantity) {
        return NextResponse.json(
          { error: `Gagal menyetujui: Stok tersedia (${loan.equipment.availableQuantity}) tidak mencukupi untuk jumlah dipinjam (${loan.quantity}).` },
          { status: 400 }
        );
      }

      // Transaction: deduct availableQuantity and update status
      const result = await prisma.$transaction([
        prisma.equipment.update({
          where: { id: loan.equipmentId },
          data: {
            availableQuantity: {
              decrement: loan.quantity,
            },
          },
        }),
        prisma.loanTransaction.update({
          where: { id: params.id },
          data: {
            status: 'APPROVED',
            adminNote: adminNote || 'Pengajuan disetujui oleh Koordinator Lab.',
          },
          include: { equipment: true, user: true },
        }),
      ]);

      return NextResponse.json(result[1]);
    }

    if (action === 'REJECT') {
      if (loan.status !== 'PENDING') {
        return NextResponse.json({ error: `Hanya pengajuan berstatus PENDING yang dapat ditolak.` }, { status: 400 });
      }

      const updated = await prisma.loanTransaction.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          adminNote: adminNote || 'Pengajuan ditolak oleh Admin Lab.',
        },
        include: { equipment: true, user: true },
      });

      return NextResponse.json(updated);
    }

    if (action === 'RETURN') {
      if (loan.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Hanya peminjaman dengan status APPROVED yang dapat dikembalikan.' }, { status: 400 });
      }

      // Transaction: restore availableQuantity and update status to RETURNED
      const result = await prisma.$transaction([
        prisma.equipment.update({
          where: { id: loan.equipmentId },
          data: {
            availableQuantity: {
              increment: loan.quantity,
            },
          },
        }),
        prisma.loanTransaction.update({
          where: { id: params.id },
          data: {
            status: 'RETURNED',
            actualReturnDate: new Date(),
            adminNote: adminNote || loan.adminNote || 'Alat telah dikembalikan dan diverifikasi.',
          },
          include: { equipment: true, user: true },
        }),
      ]);

      return NextResponse.json(result[1]);
    }

    return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update loan:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status peminjaman.' }, { status: 500 });
  }
}
