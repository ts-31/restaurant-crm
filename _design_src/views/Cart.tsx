import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CART_ITEMS } from '../data';

export default function Cart() {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    CART_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})
  );
  const [pacing, setPacing] = useState('Together');
  const [tipRate, setTipRate] = useState(0.18);

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta)
    }));
  };

  const subtotal = CART_ITEMS.reduce((sum, item) => sum + (quantities[item.id] * item.price), 0);
  const tax = subtotal * 0.08;
  const tip = subtotal * tipRate;
  const total = subtotal + tax + tip;
  const itemCount = Object.values(quantities).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-space-md flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-space-sm">
            <Link to="/" className="min-w-[44px] min-h-[44px] -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
            </Link>
            <h1 className="font-title-md text-title-md text-on-surface tracking-tight">Active Cart</h1>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm">T14</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row w-full px-space-md pt-space-md pb-36 lg:pb-12 gap-space-lg max-w-7xl mx-auto">
        <div className="flex flex-col w-full lg:w-2/3 space-y-space-lg">
          <div className="flex flex-col space-y-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Review Your Order</span>
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm tracking-wide uppercase">Kitchen Live</span>
          </div>
          <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
            <span>Table 14 · Dinner Service</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-tertiary">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              Est. wait 15–20 min
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-space-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-title-md text-title-md text-on-surface">Dishes & Drinks</h2>
            <span className="font-label-md text-label-md text-on-surface-variant">{itemCount} items selected</span>
          </div>

          {CART_ITEMS.map(item => (
            <div key={item.id} className="bg-surface-container-low rounded-xl p-space-sm shadow-sm flex flex-col space-y-space-xs">
              <div className="flex gap-space-sm items-start">
                <img className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-surface-container-high" src={item.image} alt={item.name} />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-title-md text-title-md text-on-surface truncate">{item.name}</span>
                    <span className="font-label-lg text-label-lg text-primary font-semibold flex-shrink-0">${(item.price * quantities[item.id]).toFixed(2)}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant italic line-clamp-1 mt-0.5">{item.description}</p>
                  <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm w-fit">
                    <span className="material-symbols-outlined text-[13px] text-tertiary">edit_note</span>
                    <span className="truncate max-w-[190px]">{item.note}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <button className="text-on-surface-variant hover:text-error flex items-center gap-1 text-label-sm font-label-sm transition-colors min-h-[44px] px-1" type="button">
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Modify Note</span>
                </button>
                <div className="flex items-center gap-3 bg-surface-container rounded-full px-2 py-1">
                  <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="font-label-lg text-label-lg text-on-surface min-w-[16px] text-center">{quantities[item.id]}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Link to="/" className="w-full min-h-[48px] py-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 text-primary font-label-lg text-label-lg">
            <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
            <span>Add More Dishes or Drinks</span>
          </Link>
        </div>

        <div className="flex flex-col space-y-space-xs">
          <label className="font-title-md text-title-md text-on-surface">Service Pacing</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Together', icon: 'dinner_dining' },
              { id: 'Drinks First', icon: 'local_bar' },
              { id: 'Coursed', icon: 'room_service' }
            ].map(p => (
              <button 
                key={p.id}
                onClick={() => setPacing(p.id)}
                className={`flex flex-col items-center justify-center text-center p-2.5 min-h-[48px] rounded-xl shadow-sm transition-all ${pacing === p.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'}`}
              >
                <span className={`material-symbols-outlined text-[18px] mb-1 ${pacing === p.id ? '' : 'text-on-surface-variant'}`}>{p.icon}</span>
                <span className="font-label-sm text-label-sm leading-tight">{p.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-space-xs">
          <div className="flex items-center justify-between">
            <label className="font-title-md text-title-md text-on-surface">Chef & Sommelier Notes</label>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Optional</span>
          </div>
          <textarea className="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-none" placeholder="Allergies, dietary requirements, or specific requests for the chef..." rows={2}></textarea>
        </div>

        </div>

        <div className="flex flex-col w-full lg:w-1/3 space-y-space-md">
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm space-y-space-sm sticky top-24">
            <div className="flex items-center justify-between">
            <span className="font-title-md text-title-md text-on-surface">Order Summary</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">Table 14</span>
          </div>
          <div className="space-y-2 pt-1 font-body-md text-body-md">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span className="text-on-surface font-label-lg text-label-lg">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Local Tax (8%)</span>
              <span className="text-on-surface font-label-lg text-label-lg">${tax.toFixed(2)}</span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">Staff Gratuity</span>
                <span className="text-on-surface font-label-lg text-label-lg">${tip.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { rate: 0.15, label: '15%' },
                  { rate: 0.18, label: '18%' },
                  { rate: 0.20, label: '20%' },
                  { rate: 0, label: 'Custom' }
                ].map(t => (
                  <button 
                    key={t.label}
                    onClick={() => setTipRate(t.rate)}
                    className={`min-h-[44px] py-2 rounded-lg text-center font-label-sm text-label-sm transition-all ${tipRate === t.rate ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'}`}
                  >
                    {t.label}<br/>
                    <span className="opacity-70 text-[10px]">{t.rate > 0 ? `$${(subtotal * t.rate).toFixed(2)}` : 'Other'}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-3 flex justify-between items-baseline">
              <span className="font-title-lg text-title-lg text-on-surface">Total Due</span>
              <span className="font-display-mobile text-display-mobile text-primary font-bold tracking-tight">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

          <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary text-[22px]">eco</span>
            <p className="font-body-sm text-body-sm leading-snug">
              Ingredients sourced freshly this morning from regional heirloom farms and artisanal dairies.
            </p>
          </div>
          
          <div className="hidden lg:flex flex-col space-y-2 mt-4">
            <button className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl font-label-lg text-label-lg flex items-center justify-between px-5 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
                <span>Place Order to Table 14</span>
              </span>
              <span className="font-title-md text-title-md tracking-tight">${total.toFixed(2)}</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Sent directly to kitchen station · Pay at table</span>
            </div>
          </div>
        </div>
      </div>

      <aside className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe px-space-md pt-3">
        <div className="max-w-md mx-auto flex flex-col space-y-2 pb-3">
          <button className="w-full min-h-[52px] bg-primary text-on-primary rounded-xl font-label-lg text-label-lg flex items-center justify-between px-5 shadow-lg active:scale-[0.98] transition-all">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
              <span>Place Order to Table 14</span>
            </span>
            <span className="font-title-md text-title-md tracking-tight">${total.toFixed(2)}</span>
          </button>
          <div className="flex items-center justify-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>Sent directly to kitchen station · Pay at table or via phone</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
