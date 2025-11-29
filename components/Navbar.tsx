import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-4 md:px-8 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded flex items-center justify-center border border-yellow-500/50 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-100" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-lg font-bold text-slate-200 rpg-font tracking-wider">
          Tibia<span className="text-yellow-500">Builder</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-1">
        <button className="px-4 py-2 text-sm font-medium text-yellow-500 bg-yellow-500/10 rounded-md border border-yellow-500/20">
          Dashboard
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400 font-bold">
          US
        </div>
      </div>
    </nav>
  );
};

export default Navbar;