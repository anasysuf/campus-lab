import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalEquipmentTypes,
      totalUnits,
      pendingLoansCount,
      activeLoansCount,
      todayBookingsCount,
      recentLoans,
      recentBookings,
      categories,
    ] = await Promise.all([
      // Total equipment types
      prisma.equipment.count(),
      // Aggregate total items and available items
      prisma.equipment.aggregate({
        _sum: {
          totalQuantity: true,
          availableQuantity: true,
        },
      }),
      // Pending loans count
      prisma.loanTransaction.count({
        where: { status: 'PENDING' },
      }),
      // Active approved loans count
      prisma.loanTransaction.count({
        where: { status: 'APPROVED' },
      }),
      // Today's active/approved bookings
      prisma.roomBooking.count({
        where: {
          status: 'APPROVED',
          startTime: { lte: todayEnd },
          endTime: { gte: todayStart },
        },
      }),
      // Recent loans
      prisma.loanTransaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          equipment: { select: { name: true, code: true, imageUrl: true } },
          user: { select: { name: true, nim: true, department: true, avatar: true } },
        },
      }),
      // Recent / upcoming bookings
      prisma.roomBooking.findMany({
        take: 5,
        orderBy: { startTime: 'desc' },
        include: {
          user: { select: { name: true, nim: true, department: true } },
        },
      }),
      // Categories count
      prisma.equipment.groupBy({
        by: ['category'],
        _count: {
          id: true,
        },
        _sum: {
          totalQuantity: true,
          availableQuantity: true,
        },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalEquipmentTypes,
        totalQuantity: totalUnits._sum.totalQuantity || 0,
        availableQuantity: totalUnits._sum.availableQuantity || 0,
        borrowedQuantity: (totalUnits._sum.totalQuantity || 0) - (totalUnits._sum.availableQuantity || 0),
        pendingLoansCount,
        activeLoansCount,
        todayBookingsCount,
      },
      categories,
      recentLoans,
      recentBookings,
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return NextResponse.json({ error: 'Gagal mengambil statistik dashboard' }, { status: 500 });
  }
}
