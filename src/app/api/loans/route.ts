import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, sanitizeString } from '@/lib/security';

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
    const search = sanitizeString(searchParams.get('search') || '', 100);

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

    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`loan_${session.user.id}_${ip}`, 15, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan peminjaman. Silakan tunggu sebentar.' },
        { status: 429 }
      );
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
    if (isNaN(reqQty) || reqQty < 1 || reqQty > 50) {
      return NextResponse.json({ error: 'Jumlah peminjaman tidak valid (minimal 1, maksimal 50).' }, { status: 400 });
    }

    const cleanPurpose = sanitizeString(purpose, 500);
    if (cleanPurpose.length < 5) {
      return NextResponse.json({ error: 'Tujuan peminjaman minimal harus 5 karakter.' }, { status: 400 });
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

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Format tanggal tidak valid.' }, { status: 400 });
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'Tanggal pengembalian harus setelah tanggal mulai peminjaman.' },
        { status: 400 }
      );
    }

    // Limit maximum loan period to 30 days
    const maxLoanDuration = 30 * 24 * 60 * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() > maxLoanDuration) {
      return NextResponse.json(
        { error: 'Durasi maksimal peminjaman laboratorium adalah 30 hari.' },
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
        purpose: cleanPurpose,
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
