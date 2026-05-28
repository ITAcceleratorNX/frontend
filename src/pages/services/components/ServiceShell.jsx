import React from 'react';
import { Header } from '../../../widgets';
import Footer from '../../../widgets/Footer';

/**
 * Wrapper for the new product pages (individual/cloud/room).
 * Uses the main site's Header + Footer (NOT LpHeader/LpFooter).
 */
export default function ServiceShell({ children }) {
  return (
    <div className="font-['Montserrat'] min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 pt-16 sm:pt-20">{children}</main>
      <Footer />
    </div>
  );
}
