import Link from 'next/link';
import { Boxes, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 shadow-sm">
        <Boxes className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
          The requested route, resource, or inventory SKU could not be located in the system.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
}
