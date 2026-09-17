import { Link } from 'react-router-dom';
import { MENU_ITEMS } from '../data';

export default function Menu() {
  const signatureItem = MENU_ITEMS.find(i => i.type === 'signature');
  const otherItems = MENU_ITEMS.filter(i => i.type !== 'signature');

  return (
    <div className="flex flex-col relative w-full pt-20 pb-28 min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-20 px-space-md flex flex-col justify-center gap-space-xs max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="flex flex-col">
                <span className="font-title-md text-title-md text-on-surface tracking-tight leading-none">L'Ambre</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Menu</span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="font-label-sm text-label-sm">Table 14</span>
              </div>
              <button className="min-w-[44px] min-h-[44px] px-2.5 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center gap-1 hover:bg-primary-fixed-dim transition-colors" type="button">
                <span className="material-symbols-outlined text-[18px]">notifications</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full max-w-7xl mx-auto px-space-md gap-space-lg pb-12 mt-4">
        {/* Table Welcome Banner */}
        <section className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs text-secondary">
              <span className="material-symbols-outlined text-[18px]">deck</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">Indoor Terrace · Section A</span>
            </div>
            <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">wifi</span> Bistro-Guest
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <h1 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">Table 14 Experience</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Attending Sommelier: <span className="font-medium text-on-surface">Laurent V.</span></p>
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container hover:opacity-90 transition-opacity active:scale-95 text-label-sm font-label-sm font-semibold" type="button">
              <span className="material-symbols-outlined text-[16px]">room_service</span>
              <span>Call Waiter</span>
            </button>
          </div>
        </section>

        {/* Search & Dietary Filter Tags */}
        <section className="flex flex-col gap-space-sm">
          <div className="relative flex items-center w-full">
            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">search</span>
            <input className="w-full pl-11 pr-4 py-2.5 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-xl shadow-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-bright transition-all" placeholder="Search craft pasta, aperitifs, cellar..." type="text"/>
            <button className="absolute right-2 px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-lg font-label-sm text-label-sm flex items-center gap-1 hover:text-on-surface" type="button">
              <span className="material-symbols-outlined text-[16px]">tune</span> Filter
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-space-md px-space-md">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm whitespace-nowrap shadow-xs active:scale-95 transition-transform" type="button">
              <span className="material-symbols-outlined text-[14px]">local_florist</span> Truffle Season
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap hover:bg-surface-container-high transition-colors" type="button">
              <span className="material-symbols-outlined text-[14px]">eco</span> Vegetarian
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap hover:bg-surface-container-high transition-colors" type="button">
              <span className="material-symbols-outlined text-[14px]">grain</span> Gluten-Free
            </button>
          </div>
        </section>

        {/* Menu Category Tabs */}
        <section className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-space-md px-space-md border-b-0 pb-1">
          <button className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm whitespace-nowrap" type="button">All Items</button>
          <button className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md whitespace-nowrap hover:text-on-surface transition-colors" type="button">Starters</button>
          <button className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md whitespace-nowrap hover:text-on-surface transition-colors" type="button">Handmade Pasta</button>
        </section>

        {/* Featured Item */}
        {signatureItem && (
          <section className="relative flex flex-col md:flex-row bg-surface-container-lowest rounded-2xl overflow-hidden shadow-md">
            <div className="relative w-full md:w-1/2 lg:w-3/5 h-56 md:h-auto md:min-h-[300px] overflow-hidden">
              <img className="w-full h-full object-cover" src={signatureItem.image} alt={signatureItem.name} />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface-container-lowest via-transparent to-black/30"></div>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-sm">
                <span className="material-symbols-outlined text-tertiary text-[16px]">stars</span>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider">Chef's Signature</span>
              </div>
              <div className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary shadow-sm active:scale-90 transition-transform cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </div>
            </div>
            <div className="p-space-md md:p-space-lg flex flex-col gap-space-sm justify-center md:w-1/2 lg:w-2/5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface leading-snug">{signatureItem.name}</h2>
                  <span className="font-label-sm text-label-sm text-secondary font-medium">{signatureItem.subtitle}</span>
                </div>
                <span className="font-headline-sm text-headline-sm text-primary font-semibold">${signatureItem.price.toFixed(2)}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {signatureItem.description}
              </p>
              <div className="flex items-center justify-between pt-space-xs">
                <div className="flex items-center gap-1.5">
                  {signatureItem.tags?.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">{tag}</span>
                  ))}
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-lg text-label-lg shadow-sm active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add to Order</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Other Items */}
        <div className="flex items-center justify-between pt-space-xs">
          <div>
            <h3 className="font-title-lg text-title-lg text-on-surface font-semibold">Evening Selection</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Freshly fired from our hearth oven and copper pans</p>
          </div>
          <span className="font-label-sm text-label-sm text-primary font-semibold uppercase tracking-wider cursor-pointer">Explore 24 Items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {otherItems.map(item => (
            <article key={item.id} className={`flex ${item.type === 'pizza' ? 'flex-col' : 'gap-space-md p-space-md items-center'} bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden`}>
              <div className={`relative ${item.type === 'pizza' ? 'w-full h-44' : 'w-28 h-28 rounded-xl shrink-0'}`}>
                <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                {item.badge && (
                  <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full ${item.type === 'pizza' ? 'bg-surface-container-lowest/90' : 'bg-primary text-on-primary font-label-sm text-[10px] uppercase font-bold'} shadow-xs`}>
                    {item.type === 'pizza' && <span className="w-2 h-2 rounded-full bg-secondary"></span>}
                    <span className={item.type === 'pizza' ? 'font-label-sm text-label-sm text-on-surface font-medium uppercase tracking-wide' : ''}>{item.badge}</span>
                  </div>
                )}
                {item.type === 'pizza' && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-on-surface/85 backdrop-blur-md text-surface-bright font-title-md text-title-md font-bold">
                    ${item.price.toFixed(2)}
                  </div>
                )}
              </div>
              
              <div className={`${item.type === 'pizza' ? 'p-space-md' : 'flex-1 min-w-0'} flex flex-col gap-space-xs`}>
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-title-md text-title-md text-on-surface font-semibold leading-tight truncate">{item.name}</h4>
                  {item.type !== 'pizza' && <span className="font-title-md text-title-md text-primary font-bold shrink-0">${item.price.toFixed(2)}</span>}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between pt-2">
                  {item.meta && <span className="font-label-sm text-label-sm text-outline">{item.meta}</span>}
                  {item.tags && (
                    <div className="flex gap-1">
                      {item.tags.map(tag => (
                        <span key={tag} className="font-label-sm text-label-sm text-secondary bg-secondary-container px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                  {item.type !== 'pizza' && (
                    <button className="px-3 py-1.5 bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm font-semibold rounded-lg transition-colors active:scale-95 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">add</span> Add
                    </button>
                  )}
                  {item.type === 'pizza' && (
                    <div className="flex items-center bg-surface-container rounded-xl p-1 gap-2 ml-auto">
                      <button className="w-7 h-7 rounded-lg bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors shadow-xs active:scale-95" type="button">
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="font-title-md text-title-md font-semibold text-on-surface px-1">1</span>
                      <button className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors shadow-xs active:scale-95" type="button">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(24,21,18,0.06)]">
        <div className="max-w-7xl mx-auto px-space-md pt-space-xs pb-space-sm flex flex-col md:flex-row md:justify-between md:items-center gap-space-xs md:gap-space-lg md:h-16">
          <div className="flex justify-around items-center h-14 md:h-full md:gap-8 order-2 md:order-1">
            <Link to="/" className="flex flex-col md:flex-row items-center justify-center gap-1 min-w-[48px] min-h-[48px] transition-colors text-primary font-semibold">
              <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
              <span className="font-label-sm md:font-label-md text-label-sm md:text-label-md">Menu</span>
            </Link>
            <button className="flex flex-col md:flex-row items-center justify-center gap-1 min-w-[48px] min-h-[48px] text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[22px]">wine_bar</span>
              <span className="font-label-sm md:font-label-md text-label-sm md:text-label-md">Cellar</span>
            </button>
            <Link to="/dashboard" className="flex flex-col md:flex-row items-center justify-center gap-1 min-w-[48px] min-h-[48px] text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[22px]">dashboard</span>
              <span className="font-label-sm md:font-label-md text-label-sm md:text-label-md">Staff</span>
            </Link>
          </div>
          <Link to="/cart" className="w-full md:w-auto md:min-w-[300px] flex items-center justify-between px-space-md py-2 md:py-3 bg-primary text-on-primary rounded-xl shadow-md cursor-pointer hover:bg-primary-container transition-all order-1 md:order-2">
            <div className="flex items-center gap-space-sm">
              <div className="w-7 h-7 rounded-full bg-on-primary text-primary flex items-center justify-center font-label-md text-label-md font-bold">3</div>
              <span className="font-label-lg text-label-lg tracking-wide">Active Order</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-title-md text-title-md">$48.50</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward_ios</span>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
