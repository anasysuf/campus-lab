import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/reports - Semester-based analytics & report recap
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Administrator Lab.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('year') || '2025/2026';
    const semester = searchParams.get('semester') || 'GENAP'; // 'GANJIL', 'GENAP', 'ALL'

    // Determine Date Ranges for Semester
    // Ganjil: 1 Sep - 28/29 Feb
    // Genap: 1 Mar - 31 Aug
    let startDate: Date;
    let endDate: Date;

    const [startYearStr, endYearStr] = academicYear.split('/');
    const startYear = parseInt(startYearStr, 10) || 2025;
    const endYear = parseInt(endYearStr, 10) || 2026;

    if (semester === 'GANJIL') {
      startDate = new Date(Date.UTC(startYear, 8, 1, 0, 0, 0)); // Sep 1
      endDate = new Date(Date.UTC(endYear, 1, 28, 23, 59, 59)); // Feb 28
    } else if (semester === 'GENAP') {
      startDate = new Date(Date.UTC(endYear, 2, 1, 0, 0, 0)); // Mar 1
      endDate = new Date(Date.UTC(endYear, 7, 31, 23, 59, 59)); // Aug 31
    } else {
      // Full Academic Year
      startDate = new Date(Date.UTC(startYear, 8, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(endYear, 7, 31, 23, 59, 59));
    }

    // 1. Fetch Loans in this timeframe
    const loans = await prisma.loanTransaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nim: true,
            department: true,
            phone: true,
          },
        },
        equipment: {
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
            location: true,
            condition: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate Loan Stats
    const totalLoans = loans.length;
    const approvedLoans = loans.filter((l) => l.status === 'APPROVED');
    const returnedLoans = loans.filter((l) => l.status === 'RETURNED');
    const pendingLoans = loans.filter((l) => l.status === 'PENDING');
    const rejectedLoans = loans.filter((l) => l.status === 'REJECTED');
    
    // Overdue loans (either currently approved past returnDate, or returned late)
    const now = new Date();
    const overdueLoans = loans.filter((l) => {
      if (l.status === 'APPROVED' && new Date(l.returnDate) < now) return true;
      if (l.status === 'RETURNED' && l.actualReturnDate && new Date(l.actualReturnDate) > new Date(l.returnDate)) return true;
      return false;
    });

    // On-time returns calculation
    const onTimeReturns = returnedLoans.filter((l) => {
      if (!l.actualReturnDate) return true;
      return new Date(l.actualReturnDate) <= new Date(l.returnDate);
    });
    const onTimeReturnRate = returnedLoans.length > 0
      ? Math.round((onTimeReturns.length / returnedLoans.length) * 100)
      : 100;

    // Total quantity borrowed
    const totalUnitsBorrowed = loans
      .filter((l) => l.status === 'APPROVED' || l.status === 'RETURNED')
      .reduce((acc, curr) => acc + curr.quantity, 0);

    // Top Most Borrowed Equipment
    const equipCountMap: { [key: string]: { name: string; code: string; category: string; count: number; quantity: number } } = {};
    loans.forEach((l) => {
      if (!equipCountMap[l.equipmentId]) {
        equipCountMap[l.equipmentId] = {
          name: l.equipment.name,
          code: l.equipment.code,
          category: l.equipment.category,
          count: 0,
          quantity: 0,
        };
      }
      equipCountMap[l.equipmentId].count += 1;
      equipCountMap[l.equipmentId].quantity += l.quantity;
    });

    const topEquipment = Object.values(equipCountMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Borrowers (Mahasiswa)
    const borrowerMap: { [key: string]: { name: string; nim: string | null; department: string | null; count: number } } = {};
    loans.forEach((l) => {
      if (!borrowerMap[l.userId]) {
        borrowerMap[l.userId] = {
          name: l.user.name,
          nim: l.user.nim,
          department: l.user.department,
          count: 0,
        };
      }
      borrowerMap[l.userId].count += 1;
    });

    const topBorrowers = Object.values(borrowerMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 2. Fetch Assets & Inventory
    const allEquipment = await prisma.equipment.findMany({
      orderBy: { name: 'asc' },
    });

    const newAssetsThisSemester = allEquipment.filter(
      (e) => new Date(e.createdAt) >= startDate && new Date(e.createdAt) <= endDate
    );

    const conditionBreakdown = {
      GOOD: allEquipment.filter((e) => e.condition === 'GOOD').length,
      FAIR: allEquipment.filter((e) => e.condition === 'FAIR').length,
      MAINTENANCE: allEquipment.filter((e) => e.condition === 'MAINTENANCE').length,
      DAMAGED: allEquipment.filter((e) => e.condition === 'DAMAGED').length,
    };

    const totalPhysicalUnits = allEquipment.reduce((acc, curr) => acc + curr.totalQuantity, 0);
    const availablePhysicalUnits = allEquipment.reduce((acc, curr) => acc + curr.availableQuantity, 0);

    // 3. Room Bookings in timeframe
    const roomBookings = await prisma.roomBooking.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: { name: true, nim: true, department: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({
      period: {
        academicYear,
        semester,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        label: `Semester ${semester === 'GANJIL' ? 'Ganjil' : semester === 'GENAP' ? 'Genap' : 'Penuh'} T.A ${academicYear}`,
      },
      loanRecap: {
        totalLoans,
        approvedCount: approvedLoans.length,
        returnedCount: returnedLoans.length,
        pendingCount: pendingLoans.length,
        rejectedCount: rejectedLoans.length,
        overdueCount: overdueLoans.length,
        totalUnitsBorrowed,
        topEquipment,
        topBorrowers,
        loans,
      },
      returnRecap: {
        totalReturned: returnedLoans.length,
        onTimeReturns: onTimeReturns.length,
        lateReturns: returnedLoans.length - onTimeReturns.length,
        onTimeReturnRate,
        returnedLoansList: returnedLoans,
      },
      assetRecap: {
        totalAssetTypes: allEquipment.length,
        totalPhysicalUnits,
        availablePhysicalUnits,
        newAssetsCount: newAssetsThisSemester.length,
        conditionBreakdown,
        allEquipment,
        newAssetsThisSemester,
      },
      roomRecap: {
        totalBookings: roomBookings.length,
        approvedBookings: roomBookings.filter((r) => r.status === 'APPROVED').length,
        maintenanceBookings: roomBookings.filter((r) => r.isMaintenance).length,
        bookings: roomBookings,
      },
    });
  } catch (error) {
    console.error('Failed to generate reports recap:', error);
    return NextResponse.json({ error: 'Gagal menyusun rekap laporan semester' }, { status: 500 });
  }
}
