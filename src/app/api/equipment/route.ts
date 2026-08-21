import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAutoAssetCode } from '@/lib/barcode';
import { isValidCondition, isValidImageUrl, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

// GET /api/equipment - list equipment with filters & search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = sanitizeString(searchParams.get('search') || '', 100);
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

    if (condition && condition !== 'ALL' && isValidCondition(condition)) {
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

    const cleanName = sanitizeString(name, 150);
    const cleanCategory = sanitizeString(category, 80);
    const cleanDescription = description ? sanitizeString(description, 1000) : null;
    const cleanLocation = location ? sanitizeString(location, 100) : null;
    const cleanCondition = condition && isValidCondition(condition) ? condition : 'GOOD';

    let cleanImageUrl: string | null = null;
    if (imageUrl && isValidImageUrl(imageUrl)) {
      cleanImageUrl = imageUrl;
    }

    if (!code || !code.trim()) {
      const count = await prisma.equipment.count();
      code = generateAutoAssetCode(cleanCategory, count);
    }

    const cleanCode = sanitizeString(code, 50).toUpperCase();

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
    if (isNaN(total) || total < 1 || total > 1000) {
      return NextResponse.json({ error: 'Jumlah total harus angka antara 1 dan 1000.' }, { status: 400 });
    }

    const newEquipment = await prisma.equipment.create({
      data: {
        name: cleanName,
        code: cleanCode,
        category: cleanCategory,
        description: cleanDescription,
        totalQuantity: total,
        availableQuantity: total,
        condition: cleanCondition,
        location: cleanLocation,
        imageUrl: cleanImageUrl,
      },
    });

    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error) {
    console.error('Failed to create equipment:', error);
    return NextResponse.json({ error: 'Gagal menambahkan alat ke inventaris' }, { status: 500 });
  }
}
