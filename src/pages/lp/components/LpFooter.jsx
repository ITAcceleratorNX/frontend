import React, { memo } from 'react';
import { Link } from 'react-router-dom';

/**
 * Minimal LP footer — only legal links + copyright. No main-site navigation.
 */
function LpFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full bg-[#0e1729] py-10 text-sm text-white/80">
      <div className="container mx-auto flex flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-col gap-1">
          <span className="font-soyuz-grotesk text-lg font-bold text-white">ExtraSpace</span>
          <span className="text-xs text-white/60">
            © {year} TOO «ExtraSpace». Хранение в Алматы.
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <Link to="/privacy-policy" target="_blank" className="hover:text-white">
            Политика конфиденциальности
          </Link>
          <Link to="/public-offer" target="_blank" className="hover:text-white">
            Публичная оферта
          </Link>
          <a href="tel:+77783911425" className="hover:text-white">
            +7 778 391-14-25
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default memo(LpFooter);
