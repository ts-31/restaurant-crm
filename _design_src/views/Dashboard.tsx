import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [time, setTime] = useState('');
  const [audioActive, setAudioActive] = useState(true);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
    };
    const timer = setInterval(updateClock, 1000);
    updateClock();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen">
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between py-space-lg px-space-md shadow-[0_1px_8px_rgba(30,27,24,0.04)]">
        <div className="flex flex-col gap-space-lg">
          <div className="flex items-center gap-space-sm px-space-sm">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">L'Ambre</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">TableFlow SaaS</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-space-md py-space-xs bg-surface-container rounded-lg">
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm text-on-surface">Kitchen Online</span>
            </div>
            <span className="font-label-sm text-label-sm text-primary font-bold">5 New</span>
          </div>
          <nav className="flex flex-col gap-space-xs">
            <a href="#" className="flex items-center gap-space-sm px-space-md py-space-sm transition-all bg-primary-container text-on-primary-container font-title-md rounded-lg">
              <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
              <span>Live Orders</span>
            </a>
            <a href="#" className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all">
              <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
              <span>Menu Management</span>
            </a>
            <a href="#" className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all">
              <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
              <span>Table QR Codes</span>
            </a>
            <a href="#" className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              <span>Analytics</span>
            </a>
            <a href="#" className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all">
              <span className="material-symbols-outlined text-[20px]">tune</span>
              <span>Settings</span>
            </a>
          </nav>
        </div>
        <div className="p-space-sm bg-surface-container-high rounded-xl flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-label-md text-label-md text-on-surface truncate">Sommelier Mateo</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate">Floor Lead • Shift A</span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">more_vert</span>
        </div>
      </aside>

      <div className="pl-64">
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(30,27,24,0.04)] z-40 px-space-lg flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <span className="font-label-lg text-label-lg text-on-surface-variant">Dining Operations Core</span>
            <div className="hidden md:flex items-center gap-space-xs bg-secondary-container px-space-sm py-space-xs rounded-full">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm text-on-secondary-container">Dinner Service Active</span>
            </div>
            <div className="hidden lg:flex items-center gap-space-xs bg-surface-container px-space-sm py-space-xs rounded-full">
              <span className="material-symbols-outlined text-tertiary text-[16px]">chair</span>
              <span className="font-label-sm text-label-sm text-on-surface">18/24 Tables Seated</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <button className="flex items-center gap-space-xs px-space-sm py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors" type="button">
              <span className="material-symbols-outlined text-primary text-[18px]">notifications_active</span>
              <span>Live Alerts (3)</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="relative pt-16 w-full bg-surface min-h-screen px-space-lg py-space-lg">
          <div className="flex flex-col w-full gap-space-lg">
            <section className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-md p-space-md bg-surface-container-low rounded-xl shadow-sm">
              <div className="flex flex-wrap items-center gap-space-md">
                <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Service Clock</span>
                    <span className="font-title-md text-title-md text-on-surface">{time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary font-bold">
                    <span className="material-symbols-outlined text-[18px]">table_restaurant</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Table Density</span>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-title-md text-title-md text-on-surface">18 / 24</span>
                      <span className="font-label-sm text-label-sm text-secondary bg-secondary-container px-1.5 py-0.5 rounded">75%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Kitchen Status</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-title-md text-title-md text-tertiary font-medium">Brisk Service</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">(15-20 min ticket prep)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-sm w-full xl:w-auto justify-end">
                <button 
                  onClick={() => setAudioActive(!audioActive)}
                  className={`flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm ${!audioActive ? 'opacity-60' : ''}`}
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">{audioActive ? 'notifications_active' : 'notifications_off'}</span>
                  <span className="font-label-md text-label-md">{audioActive ? 'Audio Alerts ON' : 'Audio Muted'}</span>
                </button>
                <button className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md active:scale-95">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span className="font-label-lg text-label-lg">+ New Walk-in / Order</span>
                </button>
              </div>
            </section>

            <div className="flex items-center justify-between border-b-0 pb-1">
              <div className="flex items-center gap-space-xs overflow-x-auto pb-1 max-w-full">
                <button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-highest text-on-surface font-title-md text-title-md shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[18px]">dinner_dining</span>
                  <span>Live Kitchen Feed</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm">9</span>
                </button>
                <button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-title-md text-title-md transition-colors">
                  <span className="material-symbols-outlined text-[18px]">table_chart</span>
                  <span>Active Tables & Tabs</span>
                </button>
                <button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-title-md text-title-md transition-colors">
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  <span>Menu & 86 Stock</span>
                </button>
                <button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-title-md text-title-md transition-colors">
                  <span className="material-symbols-outlined text-secondary text-[18px]">payments</span>
                  <span>Daily Sales ($4,820)</span>
                </button>
              </div>
              <div className="hidden lg:flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Priority</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary"></span> In Prep</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary"></span> Ready</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-space-md">
                
                <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-sm rounded-xl min-w-0">
                  <div className="flex items-center justify-between px-space-xs py-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-headline-sm text-headline-sm text-on-surface">New Incoming</span>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">3 Orders</span>
                  </div>

                  <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-sm gap-space-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary"></div>
                    <div className="flex items-center justify-between pl-1">
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-title-lg text-title-lg text-on-surface">#1042</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-md text-label-md">Table 14</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">timer</span> 3m ago
                      </span>
                    </div>
                    <div className="flex flex-col gap-space-xs pt-space-xs">
                      <div className="flex items-center gap-space-sm bg-surface-container-low p-space-xs rounded-lg">
                        <img className="w-12 h-12 rounded object-cover shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWbHpH6KDktxWz-7BN43kQYKJhH0HX2YD9-FEXGVXA3VHLWoha_90XfIcuFz1wuUTMvM6AbGsBgbmjp_F7A0RIhcjqrWl7Fn2G92okBODd1QlMup30weMaHlTC4LLEoYpGpWQyasEaJV_dmuEmS2U4q4n03onmCzcA5ddjPBYWsktcqUuvrUp_5CRmoAXaaCFYsCjf_UUXoEf4a2Lxjn5pQQ41CzvuUjmJe-cJSMdk3Voy5cU5Y0th" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-title-md text-title-md text-on-surface truncate">1x Tagliatelle Tartufo</span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">$38.00</span>
                          </div>
                          <span className="font-body-sm text-body-sm text-tertiary italic">Chef Spec: Parmigiano Reggiano 24mo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-sm bg-surface-container-low p-space-xs rounded-lg">
                        <img className="w-12 h-12 rounded object-cover shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoAIpIxXdLivN7RmPhMaiTTCIG8tWndvlnv3wOCVVZye_oxRaUZsp6iIMSlipbVLTtFEOE_njFKTDLHoWQv0_Ya4LN8ErZhPUjG9WsrfujKb19pWVAjtaurOmHBl5D0VZKLpZvqep76RWgThuNcsLBmppATXvDXpwVLdRx08hSdTHCel__VYJKnso4duEzosC5tBytHwFzpViADvy15a8JimR3GMIKUxnngwih2wmKhSZsIoEJxcf5" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-title-md text-title-md text-on-surface truncate">1x Burrata Margherita</span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">$28.00</span>
                          </div>
                          <span className="font-label-sm text-label-sm text-primary bg-primary-fixed/60 px-1.5 py-0.5 rounded w-fit font-bold">Kitchen Note: "Well done crust"</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-space-xs pt-1">
                        <span className="font-body-md text-body-md text-on-surface">1x Smoked Old Fashioned</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">$22.20</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-space-xs mt-space-xs border-t-0 bg-surface-container-low/50 -mx-space-md -mb-space-md px-space-md py-space-sm">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Subtotal</span>
                        <span className="font-title-md text-title-md text-on-surface font-bold">$88.20</span>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-[16px]">print</span>
                        </button>
                        <button className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm">
                          Fire Kitchen
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-sm gap-space-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary-container"></div>
                    <div className="flex items-center justify-between pl-1">
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-title-lg text-title-lg text-on-surface">#1043</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-md text-label-md">Table 8</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">timer</span> 1m ago
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-on-surface pl-1">
                      <div className="flex justify-between items-center">
                        <span className="font-body-md text-body-md">2x Aperol Spritz Veneta</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">$32.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-body-md text-body-md">1x Calamari Fritti & Aioli</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">$24.00</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-space-xs">
                      <span className="font-title-md text-title-md text-on-surface">$56.00</span>
                      <button className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all">
                        Accept Order
                      </button>
                    </div>
                  </div>

                </div>

                <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-sm rounded-xl min-w-0">
                  <div className="flex items-center justify-between px-space-xs py-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-headline-sm text-headline-sm text-on-surface">Cooking Lane</span>
                      <span className="material-symbols-outlined text-tertiary text-[18px]">skillet</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">4 Tickets</span>
                  </div>

                  <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-sm gap-space-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-title-lg text-title-lg text-on-surface">#1039</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-md text-label-md">Table 4</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">Main Course</span>
                    </div>
                    <div className="flex flex-col gap-1 bg-surface-container-low p-space-xs rounded-lg">
                      <div className="flex justify-between items-center text-label-sm font-label-sm">
                        <span className="text-tertiary font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">local_fire_department</span> 12 min in stove
                        </span>
                        <span className="text-on-surface-variant">Est: 16m</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                        <div className="h-full bg-tertiary rounded-full transition-all duration-500 w-[72%]"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-space-xs text-on-surface">
                      <div className="flex justify-between">
                        <span className="font-body-md text-body-md font-semibold">1x Ribeye 300g Prime</span>
                        <span className="font-label-sm text-label-sm text-primary font-bold">Med-Rare</span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant pl-2">• Truffle Butter Glaze</span>
                      <div className="flex justify-between">
                        <span className="font-body-md text-body-md">1x Hand-cut Truffle Fries</span>
                        <span className="font-label-sm text-label-sm text-secondary">Frying</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-space-xs mt-space-xs border-t-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Chef Marco</span>
                      <button className="px-space-md py-1.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary/90 font-label-md text-label-md transition-colors flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Mark Ready
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-sm gap-space-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-title-lg text-title-lg text-on-surface">#1040</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-md text-label-md">Table 11</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">timer</span> 8m elapsed
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className="h-full bg-tertiary-container rounded-full w-[45%]"></div>
                    </div>
                    <div className="flex flex-col gap-1 text-on-surface">
                      <span className="font-body-md text-body-md">2x Pizza Margherita Classica</span>
                      <span className="font-body-md text-body-md">1x Rigatoni al Ragù Bolognese</span>
                    </div>
                    <div className="flex items-center justify-between pt-space-xs">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Station: Pizza Wood-Oven</span>
                      <button className="px-space-sm py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors">
                        Expedite +2m
                      </button>
                    </div>
                  </div>

                </div>

                <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-sm rounded-xl min-w-0">
                  <div className="flex items-center justify-between px-space-xs py-space-xs">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-headline-sm text-headline-sm text-on-surface">Ready for Pass</span>
                      <span className="material-symbols-outlined text-secondary text-[18px]">room_service</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">2 Hot Pass</span>
                  </div>

                  <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-sm gap-space-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary"></div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-title-lg text-title-lg text-on-surface font-bold">#1037</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold">Table 7</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Bell Rang
                      </span>
                    </div>
                    <div className="flex flex-col gap-space-xs bg-surface-container-low/60 p-space-xs rounded-lg">
                      <div className="flex justify-between items-center text-on-surface">
                        <span className="font-body-md text-body-md font-semibold">1x Tiramisù Tradizionale</span>
                        <span className="font-label-sm text-label-sm text-secondary font-bold">Plated</span>
                      </div>
                      <div className="flex justify-between items-center text-on-surface">
                        <span className="font-body-md text-body-md font-semibold">2x Espresso Romano</span>
                        <span className="font-label-sm text-label-sm text-secondary font-bold">Pulled</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                      <span>Runner: Claire (Station 2)</span>
                      <span className="text-tertiary">Ready 1m ago</span>
                    </div>
                    <button className="w-full py-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary/90 font-label-lg text-label-lg transition-transform active:scale-98 shadow-sm flex items-center justify-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px]">done_all</span>
                      <span>Served / Complete Order</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-space-xs mt-space-md p-space-sm bg-surface-container rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface font-bold">Completed (12 Recent)</span>
                      <span className="font-label-sm text-label-sm text-primary cursor-pointer hover:underline">View History</span>
                    </div>
                    {[
                      { table: 'Table 2 • 4 covers', amount: '$214.50' },
                      { table: 'Table 16 • 2 covers', amount: '$112.00' },
                      { table: 'Bar 1 • Walk-in', amount: '$45.00' }
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-space-xs bg-surface-container-lowest rounded-lg">
                        <div className="flex items-center gap-space-xs">
                          <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                          <span className="font-body-sm text-body-sm text-on-surface">{c.table}</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">{c.amount}</span>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-space-md bg-surface-container-low p-space-md rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface leading-snug">Quick 86 Board</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Live Kitchen & QR Menu Sync</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-surface-container-highest hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  </button>
                </div>
                
                <div className="relative w-full">
                  <span className="material-symbols-outlined text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">search</span>
                  <input className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs" placeholder="Search dish to 86 or pause..." type="text"/>
                </div>

                <div className="flex flex-col gap-space-sm">
                  {[
                    { name: 'Tagliatelle al Tartufo', status: 'In Stock • 8 Portions Left', active: true, price: '$38.00', meta: 'Cook Time: 14m' },
                    { name: 'Burrata Margherita', status: 'Active • Ample Stock', active: true, price: '$28.00', meta: 'Cook Time: 9m' },
                    { name: 'Chilean Sea Bass', status: 'Sold Out for dinner shift', active: false, price: '$46.00', meta: 'QR Menu Auto-hidden', error: true },
                    { name: 'Wagyu Carpaccio', status: 'Low • 3 Orders Remaining', active: true, price: '$24.00', meta: 'Cold Larder' },
                  ].map((item, i) => (
                    <div key={i} className={`flex flex-col gap-space-xs bg-surface-container-lowest p-space-sm rounded-xl shadow-xs ${!item.active ? 'opacity-75' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-space-xs">
                            <span className={`font-title-md text-title-md text-on-surface truncate ${!item.active ? 'line-through' : ''}`}>{item.name}</span>
                            {!item.active && <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">86'D</span>}
                          </div>
                          <span className={`font-body-sm text-body-sm font-semibold ${item.error ? 'text-error' : (item.name === 'Wagyu Carpaccio' ? 'text-tertiary' : 'text-secondary')}`}>{item.status}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={item.active} />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-surface-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-on-surface-variant font-label-sm text-label-sm">
                        <span className={!item.active ? 'line-through' : ''}>Price: {item.price}</span>
                        <span className={item.error ? 'text-error font-medium' : (item.name === 'Wagyu Carpaccio' ? 'text-secondary' : 'text-tertiary')}>{item.meta}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-space-xs pt-space-xs mt-auto">
                  <button className="w-full py-2 rounded-lg bg-surface-container-highest hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-space-xs">
                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    <span>Quick Edit Price & Prep Times</span>
                  </button>
                  <div className="p-space-sm bg-surface-container-lowest rounded-xl flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[20px]">bolt</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface font-bold">Floor Lead Insight</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Turnover rate 42m (Target 55m)</span>
                    </div>
                  </div>
                </div>
              </aside>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
