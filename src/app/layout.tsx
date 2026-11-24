import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Inventory System - Modern Enterprise Inventory & Order Platform',
  description: 'Enterprise-grade connected inventory, warehouse, PO, and sales order fulfillment platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500 selection:text-white">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
