import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🛡️  Starting fresh database wipe and rebuild...');

  // 1. Clean existing data in correct relational order
  await prisma.loanTransaction.deleteMany();
  await prisma.roomBooking.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Old data cleared.');

  // 2. Hash passwords with bcrypt
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordStudent = await bcrypt.hash('student123', 10);

  // 3. Create Admin & Student Users
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Ir. Budi Santoso, M.Kom.',
      email: 'admin@campus.ac.id',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
      nim: '198504122010121001',
      department: 'Kepala Laboratorium Terpadu',
      phone: '081234567890',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: 'Ahmad Fauzi Rahman',
      email: 'student@campus.ac.id',
      password: hashedPasswordStudent,
      role: 'STUDENT',
      nim: '21051204055',
      department: 'S1 Teknik Informatika',
      phone: '085712345678',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Sarah Amanda Putri',
      email: 'sarah@campus.ac.id',
      password: hashedPasswordStudent,
      role: 'STUDENT',
      nim: '21051204088',
      department: 'S1 Sistem Informasi',
      phone: '081398765432',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'Bima Arya Wicaksono',
      email: 'bima@campus.ac.id',
      password: hashedPasswordStudent,
      role: 'STUDENT',
      nim: '21051204012',
      department: 'S1 Teknik Elektro',
      phone: '082155667788',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: 'Nadia Larasati',
      email: 'nadia@campus.ac.id',
      password: hashedPasswordStudent,
      role: 'STUDENT',
      nim: '21051204099',
      department: 'D4 Teknologi Rekayasa Multimedia',
      phone: '087811223344',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ Users created.');

  // 4. Create Equipment Inventory
  const equipmentList = [
    {
      name: 'Digital Storage Oscilloscope 100MHz 2CH (Rigol DS1102Z-E)',
      code: 'EQ-OSC-001',
      category: 'Electronics & IoT',
      description: 'Oscilloscope digital resolusi tinggi dengan sampling rate 1GSa/s untuk pengujian sinyal rangkaian mikrokontroler dan sirkuit digital.',
      totalQuantity: 6,
      availableQuantity: 4,
      condition: 'GOOD',
      location: 'Lab Elektronika - Rak A1',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Arduino Mega 2560 R3 + Complete Sensor & Actuator Kit',
      code: 'EQ-ARD-002',
      category: 'Electronics & IoT',
      description: 'Kit mikrokontroler lengkap dengan sensor suhu DHT22, ultrasonic HC-SR04, servo motor SG90, LCD I2C, relay 4-ch, dan breadboard.',
      totalQuantity: 15,
      availableQuantity: 12,
      condition: 'GOOD',
      location: 'Lab IoT - Lemari B2',
      imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Raspberry Pi 4 Model B (8GB RAM) Starter Kit',
      code: 'EQ-RPI-003',
      category: 'Computer & Network',
      description: 'Mini PC Raspberry Pi 4 Quad-core 1.5GHz dengan MicroSD 64GB SanDisk Ultra, casing aluminium pendingin, dan power supply Type-C 15W.',
      totalQuantity: 10,
      availableQuantity: 8,
      condition: 'GOOD',
      location: 'Lab Jaringan - Rak C1',
      imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Creality Ender-3 V2 Neo 3D Printer',
      code: 'EQ-3DP-004',
      category: 'Robotics & AI',
      description: '3D Printer FDM presisi tinggi dengan auto bed leveling CR Touch, volume cetak 220x220x250mm, dan platform cetak spring steel PC.',
      totalQuantity: 3,
      availableQuantity: 2,
      condition: 'GOOD',
      location: 'Lab Robotika - Meja Fabrikasi',
      imageUrl: 'https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Meta Quest 3 VR Headset (512GB) + Touch Controllers',
      code: 'EQ-VR-005',
      category: 'Multimedia & VR',
      description: 'Headset Virtual Reality standalone resolusi 4K+ Infinite Display dengan Passthrough Full-Color untuk riset mixed-reality & metaverse.',
      totalQuantity: 4,
      availableQuantity: 3,
      condition: 'GOOD',
      location: 'Lab Multimedia - Lemari Khusus VR',
      imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Cisco Catalyst 2960-X Managed Switch 24-Port Gigabit',
      code: 'EQ-NET-006',
      category: 'Computer & Network',
      description: 'Switch manageable enterprise Layer 2 dengan 24 port 10/100/1000 dan 4 port SFP uplink untuk praktikum jaringan komputer dan routing.',
      totalQuantity: 5,
      availableQuantity: 5,
      condition: 'GOOD',
      location: 'Lab Jaringan - Rack Server 01',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Digital Multimeter True RMS Auto-Ranging (Fluke 115)',
      code: 'EQ-DMM-007',
      category: 'General Lab Tools',
      description: 'Multimeter profesional untuk pengukuran tegangan AC/DC hingga 600V, arus, resistansi, kontinuitas, frekuensi, dan kapasitansi.',
      totalQuantity: 12,
      availableQuantity: 10,
      condition: 'GOOD',
      location: 'Lab Elektronika - Rak A2',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'NVIDIA Jetson Nano Developer Kit B01 4GB',
      code: 'EQ-JTS-008',
      category: 'Robotics & AI',
      description: 'Papan komputasi AI edge compact dengan GPU 128-core NVIDIA Maxwell untuk deep learning inference, computer vision, dan robotika cerdas.',
      totalQuantity: 8,
      availableQuantity: 7,
      condition: 'GOOD',
      location: 'Lab Robotika - Lemari AI',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Mikroskop Digital USB 1000x HD dengan Stand Logam',
      code: 'EQ-MIC-009',
      category: 'Special Education Tools',
      description: 'Mikroskop digital pembesaran 50x - 1000x dengan 8 LED adjustable, koneksi USB/OTG untuk inspeksi soldering PCB mikro dan observasi spesimen.',
      totalQuantity: 6,
      availableQuantity: 5,
      condition: 'FAIR',
      location: 'Lab Elektronika - Meja Inspeksi',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Soldering Station Digital Temperature Controlled (Hakko FX-888D)',
      code: 'EQ-SLD-010',
      category: 'General Lab Tools',
      description: 'Stasiun solder digital dengan kontrol temperatur presisi 200°C - 480°C, proteksi ESD safe, dan heating element keramik berkualitas tinggi.',
      totalQuantity: 8,
      availableQuantity: 7,
      condition: 'GOOD',
      location: 'Lab Elektronika - Rak Solder',
      imageUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Logic Analyzer 24MHz 8-Channel USB',
      code: 'EQ-LOG-011',
      category: 'Electronics & IoT',
      description: 'Penganalisis logika digital 8-channel USB kompatibel dengan protokol I2C, SPI, UART, dan CAN bus untuk debugging komunikasi mikrokontroler.',
      totalQuantity: 10,
      availableQuantity: 10,
      condition: 'GOOD',
      location: 'Lab IoT - Rak C2',
      imageUrl: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sony Alpha A7 IV Mirrorless Camera Body + 28-70mm Lens',
      code: 'EQ-CAM-012',
      category: 'Multimedia & VR',
      description: 'Kamera full-frame 33MP untuk pembuatan konten laboratorium, dokumentasi riset video 4K 60p, dan studio multimedia kampus.',
      totalQuantity: 2,
      availableQuantity: 2,
      condition: 'GOOD',
      location: 'Lab Multimedia - Dry Box Kamera',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const createdEquipment = [];
  for (const eq of equipmentList) {
    const item = await prisma.equipment.create({ data: eq });
    createdEquipment.push(item);
  }

  console.log(`✅ ${createdEquipment.length} Equipment items seeded.`);

  // 5. Create Sample Loan Transactions
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const pastThreeDays = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const lastMonthReturn = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000);

  // Loan 1: PENDING
  await prisma.loanTransaction.create({
    data: {
      userId: student1.id,
      equipmentId: createdEquipment[0].id, // Oscilloscope
      quantity: 1,
      requestDate: now,
      returnDate: nextWeek,
      status: 'PENDING',
      purpose: 'Pengambilan data osiloskop untuk Tugas Akhir sistem monitoring daya inverter PV cerdas.',
    },
  });

  // Loan 2: APPROVED (Active)
  await prisma.loanTransaction.create({
    data: {
      userId: student1.id,
      equipmentId: createdEquipment[1].id, // Arduino Kit
      quantity: 2,
      requestDate: pastThreeDays,
      returnDate: nextWeek,
      status: 'APPROVED',
      purpose: 'Praktikum Proyek Embedded System & IoT Smart Greenhouse.',
      adminNote: 'Disetujui. Harap menjaga kelengkapan modul sensor saat pengembalian.',
    },
  });

  // Loan 3: APPROVED (Active)
  await prisma.loanTransaction.create({
    data: {
      userId: student3.id,
      equipmentId: createdEquipment[3].id, // 3D Printer
      quantity: 1,
      requestDate: pastThreeDays,
      returnDate: nextWeek,
      status: 'APPROVED',
      purpose: 'Fabrikasi casing robot otonom untuk kompetisi robotika nasional.',
      adminNote: 'Disetujui. Penggunaan bahan filamen PLA dicatat terpisah.',
    },
  });

  // Loan 4: RETURNED
  await prisma.loanTransaction.create({
    data: {
      userId: student2.id,
      equipmentId: createdEquipment[2].id, // Raspberry Pi
      quantity: 1,
      requestDate: pastThreeDays,
      returnDate: yesterday,
      actualReturnDate: yesterday,
      status: 'RETURNED',
      purpose: 'Uji coba deployment server MQTT lokal untuk praktikum jaringan sensor nirkabel.',
      adminNote: 'Alat dikembalikan dalam kondisi lengkap dan berfungsi baik.',
    },
  });

  // Loan 5: RETURNED
  await prisma.loanTransaction.create({
    data: {
      userId: student4.id,
      equipmentId: createdEquipment[4].id, // VR Headset
      quantity: 1,
      requestDate: lastMonth,
      returnDate: lastMonthReturn,
      actualReturnDate: lastMonthReturn,
      status: 'RETURNED',
      purpose: 'Pengujian User Experience game edukasi berbasis VR untuk mahasiswa.',
      adminNote: 'Disetujui dan telah dikembalikan tepat waktu.',
    },
  });

  // Loan 6: REJECTED
  await prisma.loanTransaction.create({
    data: {
      userId: student2.id,
      equipmentId: createdEquipment[4].id, // VR Headset
      quantity: 1,
      requestDate: pastThreeDays,
      returnDate: yesterday,
      status: 'REJECTED',
      purpose: 'Penggunaan pribadi di luar kampus.',
      adminNote: 'Ditolak: Headset VR hanya diperbolehkan untuk riset di dalam area laboratorium multimedia.',
    },
  });

  console.log('✅ Loan transactions seeded.');

  // 6. Create Sample Room Bookings
  const todayMorning = new Date();
  todayMorning.setHours(9, 0, 0, 0);
  const todayNoon = new Date();
  todayNoon.setHours(12, 0, 0, 0);

  const tomorrowMorning = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrowMorning.setHours(13, 0, 0, 0);
  const tomorrowAfternoon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrowAfternoon.setHours(16, 0, 0, 0);

  const maintenanceStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  maintenanceStart.setHours(8, 0, 0, 0);
  const maintenanceEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  maintenanceEnd.setHours(17, 0, 0, 0);

  await prisma.roomBooking.create({
    data: {
      userId: student1.id,
      roomName: 'Lab Komputer & AI (Gedung B Lt. 3)',
      startTime: todayMorning,
      endTime: todayNoon,
      purpose: 'Sesi latihan tim Hackathon Kampus untuk implementasi model LLM & Computer Vision.',
      status: 'APPROVED',
      adminNote: 'Disetujui. Kunci lab dapat diambil di ruang staf sebelum pukul 09:00.',
    },
  });

  await prisma.roomBooking.create({
    data: {
      userId: student2.id,
      roomName: 'Lab Multimedia & VR (Gedung B Lt. 2)',
      startTime: tomorrowMorning,
      endTime: tomorrowAfternoon,
      purpose: 'Pengujian User Experience game edukasi berbasis VR untuk mahasiswa.',
      status: 'PENDING',
    },
  });

  await prisma.roomBooking.create({
    data: {
      userId: student3.id,
      roomName: 'Lab Robotika & Mekatronika (Gedung A Lt. 2)',
      startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      purpose: 'Uji lintasan robot line follower dan kalibrasi sensor PID.',
      status: 'APPROVED',
      adminNote: 'Disetujui. Harap merapikan arena uji setelah selesai.',
    },
  });

  // Maintenance block by Admin
  await prisma.roomBooking.create({
    data: {
      userId: admin.id,
      roomName: 'Lab Elektronika & IoT (Gedung A Lt. 1)',
      startTime: maintenanceStart,
      endTime: maintenanceEnd,
      purpose: 'Pemeliharaan berkala & kalibrasi tahunan instrumen osiloskop dan stasiun solder.',
      status: 'APPROVED',
      isMaintenance: true,
      adminNote: 'Jadwal Pemeliharaan Rutin Tim Teknisi Lab.',
    },
  });

  console.log('✅ Room bookings seeded.');
  console.log('🎉 Database rebuild & seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
