import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidCondition, isValidImageUrl, sanitizeString } from '@/lib/security';

// GET /api/equipment/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
      include: {
        loans: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, nim: true, department: true, email: true },
            },
          },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Peralatan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Failed to get equipment details:', error);
    return NextResponse.json({ error: 'Gagal mengambil detail peralatan' }, { status: 500 });
  }
}

// PUT /api/equipment/[id] - Update equipment (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin Laboratorium.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, category, description, totalQuantity, availableQuantity, condition, location, imageUrl } = body;

    const existing = await prisma.equipment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Peralatan tidak ditemukan' }, { status: 404 });
    }

    const cleanCode = code ? sanitizeString(code, 50).toUpperCase() : existing.code;

    // Check code uniqueness if changed
    if (cleanCode && cleanCode !== existing.code) {
      const codeExists = await prisma.equipment.findUnique({
        where: { code: cleanCode },
      });
      if (codeExists) {
        return NextResponse.json({ error: 'Kode inventaris sudah digunakan.' }, { status: 409 });
      }
    }

    const updated = await prisma.equipment.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? sanitizeString(name, 150) : existing.name,
        code: cleanCode,
        category: category !== undefined ? sanitizeString(category, 80) : existing.category,
        description: description !== undefined ? (description ? sanitizeString(description, 1000) : null) : existing.description,
        totalQuantity: totalQuantity !== undefined ? Math.max(1, parseInt(totalQuantity, 10)) : existing.totalQuantity,
        availableQuantity: availableQuantity !== undefined ? Math.max(0, parseInt(availableQuantity, 10)) : existing.availableQuantity,
        condition: condition !== undefined && isValidCondition(condition) ? condition : existing.condition,
        location: location !== undefined ? (location ? sanitizeString(location, 100) : null) : existing.location,
        imageUrl: imageUrl !== undefined ? (imageUrl && isValidImageUrl(imageUrl) ? imageUrl : null) : existing.imageUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update equipment:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data peralatan' }, { status: 500 });
  }
}

// DELETE /api/equipment/[id] - Delete equipment (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Admin Laboratorium.' }, { status: 403 });
    }

    // Check active loans
    const activeLoans = await prisma.loanTransaction.count({
      where: {
        equipmentId: params.id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (activeLoans > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus peralatan yang masih dalam status peminjaman aktif atau pending.' },
        { status: 400 }
      );
    }

    await prisma.equipment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Peralatan berhasil dihapus dari inventaris.' });
  } catch (error) {
    console.error('Failed to delete equipment:', error);
    return NextResponse.json({ error: 'Gagal menghapus peralatan' }, { status: 500 });
  }
}
