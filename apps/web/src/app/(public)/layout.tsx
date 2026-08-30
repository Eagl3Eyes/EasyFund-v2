import { SmartNavbar } from '@/components/layout/smart-navbar';
import { Footer } from '@/components/layout/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SmartNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
