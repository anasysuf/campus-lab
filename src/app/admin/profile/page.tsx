'use client';

import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import ProfileSettingsForm from '@/components/profile/ProfileSettingsForm';

export default function AdminProfilePage() {
  return (
    <DashboardShell
      title="Pengaturan Akun Pribadi Admin"
      subtitle="Kelola data profil, kontak, foto avatar, dan kata sandi akun administrator laboratorium"
    >
      <ProfileSettingsForm />
    </DashboardShell>
  );
}
