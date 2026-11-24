import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @type {(phase: string) => import('next').NextConfig} */
const nextConfig = (phase) => ({
  reactStrictMode: false, // helps avoid double-mount issues with in-memory stores during dev
  // Isolate dev server output from production builds so running `npm run build`
  // never wipes or corrupts an active `npm run dev` session.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
});

export default nextConfig;
