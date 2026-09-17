/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Menu from './views/Menu';
import Cart from './views/Cart';
import Dashboard from './views/Dashboard';

function NavigationOverlay() {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-24 right-4 z-[9999] bg-surface-container-highest p-2 rounded-2xl shadow-xl flex flex-col gap-2 opacity-80 hover:opacity-100 transition-opacity">
      <div className="text-xs font-bold px-2 py-1 uppercase tracking-wider text-on-surface">Preview Nav</div>
      <Link 
        to="/" 
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${location.pathname === '/' ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant text-on-surface'}`}
      >
        Menu View
      </Link>
      <Link 
        to="/cart" 
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${location.pathname === '/cart' ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant text-on-surface'}`}
      >
        Cart View
      </Link>
      <Link 
        to="/dashboard" 
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${location.pathname === '/dashboard' ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant text-on-surface'}`}
      >
        Dashboard View
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <NavigationOverlay />
    </BrowserRouter>
  );
}
