import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from './dashboard-shell';
import { getApiUrl } from '@/lib/config';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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
  } catch {
    redirect('/auth/login');
  }

  return (
    <div className="bg-[#060e1e] text-white selection:bg-[#0ef695]/30">
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
