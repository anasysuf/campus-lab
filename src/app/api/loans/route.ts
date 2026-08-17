import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/loans - get list of loans
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Silakan login.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    // If student, can only see their own loans
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { purpose: { contains: search, mode: 'insensitive' } },
        { equipment: { name: { contains: search, mode: 'insensitive' } } },
        { equipment: { code: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { nim: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const loans = await prisma.loanTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
            imageUrl: true,
            condition: true,
            location: true,
            availableQuantity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nim: true,
            department: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error('Failed to fetch loans:', error);
    return NextResponse.json({ error: 'Gagal mengambil data peminjaman' }, { status: 500 });
  }
}

// POST /api/loans - Student creates a new loan request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const body = await request.json();
    const { equipmentId, quantity = 1, requestDate, returnDate, purpose } = body;

    if (!equipmentId || !returnDate || !purpose) {
      return NextResponse.json(
        { error: 'Peralatan, tanggal pengembalian, dan tujuan peminjaman wajib diisi.' },
        { status: 400 }
      );
    }

    const reqQty = parseInt(quantity, 10);
    if (isNaN(reqQty) || reqQty < 1) {
      return NextResponse.json({ error: 'Jumlah peminjaman minimal 1 unit.' }, { status: 400 });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Peralatan tidak ditemukan.' }, { status: 404 });
    }

    if (equipment.availableQuantity < reqQty) {
      return NextResponse.json(
        { error: `Stok tidak mencukupi. Stok tersedia hanya ${equipment.availableQuantity} unit.` },
        { status: 400 }
      );
    }

    const startDate = requestDate ? new Date(requestDate) : new Date();
    const endDate = new Date(returnDate);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'Tanggal pengembalian harus setelah tanggal mulai peminjaman.' },
        { status: 400 }
      );
    }

    const newLoan = await prisma.loanTransaction.create({
      data: {
        userId: session.user.id,
        equipmentId,
        quantity: reqQty,
        requestDate: startDate,
        returnDate: endDate,
        purpose: purpose.trim(),
        status: 'PENDING',
      },
      include: {
        equipment: true,
      },
    });

    return NextResponse.json(newLoan, { status: 201 });
  } catch (error) {
    console.error('Failed to create loan request:', error);
    return NextResponse.json({ error: 'Gagal membuat pengajuan peminjaman' }, { status: 500 });
  }
}
