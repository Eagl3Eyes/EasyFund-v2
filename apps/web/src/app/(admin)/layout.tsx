import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import { DashboardShell } from '../(dashboard)/dashboard-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  try {
    const res = await fetch(`${getApiUrl()}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      redirect('/auth/login');
    }

    const data = await res.json();
    if (data.data?.role !== 'admin') {
      redirect('/dashboard');
    }
  } catch {
    redirect('/auth/login');
  }

  return (
    <div className="bg-[#060e1e] text-white selection:bg-[#0ef695]/30">
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
