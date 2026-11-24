'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { CreatePOModal } from '@/components/modals/CreatePOModal';
import { CreateSaleModal } from '@/components/modals/CreateSaleModal';
import { CreateProductModal } from '@/components/modals/CreateProductModal';
import { ToastProvider } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface AppActionsContextType {
  openCreatePO: (productId?: string, quantity?: number) => void;
  openCreateSale: () => void;
  openCreateProduct: () => void;
  openCommandPalette: () => void;
  triggerRefresh: () => void;
  refreshVersion: number;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

const AppActionsContext = createContext<AppActionsContextType | undefined>(undefined);

export function useAppActions() {
  const context = useContext(AppActionsContext);
  if (!context) {
    throw new Error('useAppActions must be used within AppLayout');
  }
  return context;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Modals state
  const [createPOOpen, setCreatePOOpen] = useState(false);
  const [poPrefill, setPoPrefill] = useState<{ productId?: string; quantity?: number }>({});
  const [createSaleOpen, setCreateSaleOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);

  // Refresh trigger counter so child pages can re-fetch when an action completes
  const [refreshVersion, setRefreshVersion] = useState(0);

  // Read saved collapse state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const handleSetSidebarCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    setSidebarCollapsed((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const triggerRefresh = useCallback(() => {
    setRefreshVersion((v) => v + 1);
  }, []);

  const openCreatePO = useCallback((productId?: string, quantity?: number) => {
    setPoPrefill({ productId, quantity });
    setCreatePOOpen(true);
  }, []);

  const openCreateSale = useCallback(() => {
    setCreateSaleOpen(true);
  }, []);

  const openCreateProduct = useCallback(() => {
    setCreateProductOpen(true);
  }, []);

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  return (
    <ToastProvider>
      <AppActionsContext.Provider
        value={{
          openCreatePO,
          openCreateSale,
          openCreateProduct,
          openCommandPalette,
          triggerRefresh,
          refreshVersion,
          sidebarCollapsed,
          setSidebarCollapsed: handleSetSidebarCollapsed,
        }}
      >
        <div className="min-h-screen bg-[#F0F7F6] dark:bg-[#071317] text-zinc-900 dark:text-zinc-100 flex flex-col antialiased transition-colors">
          {/* Left Fixed Collapsible Navigation Sidebar */}
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
            collapsed={sidebarCollapsed}
            setCollapsed={handleSetSidebarCollapsed}
          />

          {/* Main App Shell with responsive dynamic padding */}
          <div
            className={cn(
              'flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out',
              sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
            )}
          >
            {/* Sticky Header */}
            <Header
              onOpenSearch={openCommandPalette}
              onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
              onOpenCreatePO={() => openCreatePO()}
              onOpenCreateSale={openCreateSale}
              onOpenCreateProduct={openCreateProduct}
              onDataMutated={triggerRefresh}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebarCollapse={() => handleSetSidebarCollapsed((prev) => !prev)}
            />

            {/* Page Canvas */}
            <main className="flex-1 p-3.5 sm:p-5 lg:p-7 max-w-[1700px] w-full mx-auto animate-in fade-in duration-150">
              {children}
            </main>
          </div>

          {/* Command Palette */}
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
            onOpenCreatePO={() => openCreatePO()}
            onOpenCreateSale={openCreateSale}
            onOpenCreateProduct={openCreateProduct}
          />

          {/* Global Modals */}
          <CreatePOModal
            isOpen={createPOOpen}
            onClose={() => {
              setCreatePOOpen(false);
              setPoPrefill({});
            }}
            onSuccess={triggerRefresh}
            prefillProductId={poPrefill.productId}
            prefillQuantity={poPrefill.quantity}
          />

          <CreateSaleModal
            isOpen={createSaleOpen}
            onClose={() => setCreateSaleOpen(false)}
            onSuccess={triggerRefresh}
          />

          <CreateProductModal
            isOpen={createProductOpen}
            onClose={() => setCreateProductOpen(false)}
            onSuccess={triggerRefresh}
          />
        </div>
      </AppActionsContext.Provider>
    </ToastProvider>
  );
}
