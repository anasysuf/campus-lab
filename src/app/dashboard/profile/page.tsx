'use client';

import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import ProfileSettingsForm from '@/components/profile/ProfileSettingsForm';

export default function StudentProfilePage() {
  return (
    <DashboardShell
      title="Pengaturan Akun Pribadi Mahasiswa"
      subtitle="Kelola informasi data diri, foto KTM, kontak WhatsApp, dan kata sandi akun Anda"
    >
      <ProfileSettingsForm />
    </DashboardShell>
  );
}
