import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAutoAssetCode } from '@/lib/barcode';

export const dynamic = 'force-dynamic';

// GET /api/equipment - list equipment with filters & search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const condition = searchParams.get('condition') || '';
    const availableOnly = searchParams.get('availableOnly') === 'true';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (condition && condition !== 'ALL') {
      where.condition = condition;
    }

    if (availableOnly) {
      where.availableQuantity = { gt: 0 };
    }

    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            loans: {
              where: { status: 'APPROVED' },
            },
          },
        },
      },
    });

    // Also get categories list for filters
    const categories = await prisma.equipment.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    return NextResponse.json({
      equipment,
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error('Failed to fetch equipment:', error);
    return NextResponse.json({ error: 'Gagal mengambil data peralatan' }, { status: 500 });
  }
}

// POST /api/equipment - Create new equipment (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin Laboratorium.' }, { status: 403 });
    }

    const body = await request.json();
    let { name, code, category, description, totalQuantity, condition, location, imageUrl } = body;

    if (!name || !category || totalQuantity === undefined) {
      return NextResponse.json(
        { error: 'Nama alat, kategori, dan jumlah total wajib diisi.' },
        { status: 400 }
      );
    }

    if (!code || !code.trim()) {
      const count = await prisma.equipment.count();
      code = generateAutoAssetCode(category, count);
    }

    const cleanCode = code.toUpperCase().trim();

    // Check unique code
    const existing = await prisma.equipment.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Kode inventaris "${cleanCode}" sudah digunakan. Silakan gunakan kode lain atau generate otomatis.` },
        { status: 409 }
      );
    }

    const total = parseInt(totalQuantity, 10);
    if (isNaN(total) || total < 1) {
      return NextResponse.json({ error: 'Jumlah total harus angka minimal 1.' }, { status: 400 });
    }

    const newEquipment = await prisma.equipment.create({
      data: {
        name,
        code: cleanCode,
        category,
        description: description || null,
        totalQuantity: total,
        availableQuantity: total,
        condition: condition || 'GOOD',
        location: location || null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error) {
    console.error('Failed to create equipment:', error);
    return NextResponse.json({ error: 'Gagal menambahkan alat ke inventaris' }, { status: 500 });
  }
}
