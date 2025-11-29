import React from 'react';
import { Item, EquippedItems, SlotType } from '../../../types/infotypes';

interface InfoPanelProps {
  items: EquippedItems;
}

const TIBIA_ELEMENTS = ['Physical', 'Fire', 'Energy', 'Earth', 'Ice', 'Holy', 'Death'];

// Helper to parse and aggregate stats
const aggregateStats = (items: Item[]) => {
  const stats: Record<string, number> = {};
  const flags: Set<string> = new Set();
  const protections: Record<string, number> = {};

  items.forEach(item => {
    // 1. Parse Bonuses
    if (item.bonus) {
      // Primeiro, verificar se é um formato múltiplo como "Sword Fighting: 3, Club Fighting: 3"
      if (item.bonus.includes(',')) {
        const bonusParts = item.bonus.split(',').map(part => part.trim());
        bonusParts.forEach(part => {
          const match = part.match(/^(.+?)\s*:\s*(\d+)$/);
          if (match) {
            const originalName = match[1].trim(); // "Sword Fighting"
            const normalizedName = originalName.toLowerCase(); // "sword fighting"
            const value = parseInt(match[2], 10);
            stats[normalizedName] = (stats[normalizedName] || 0) + value;
          } else {
            // Para bônus individuais que não estão no formato "Nome: Valor"
            const match2 = part.match(/^(.+?)\s?\+?(\d+)$/);
            if (match2) {
              const originalName = match2[1].trim(); // "Magic Level"
              const normalizedName = originalName.toLowerCase(); // "magic level"
              const value = parseInt(match2[2], 10);
              stats[normalizedName] = (stats[normalizedName] || 0) + value;
            } else {
              // Non-numeric bonus like "Regeneration" or "Fire Attack"
              flags.add(part.trim());
            }
          }
        });
      } else {
        // Para bônus únicos, verificar ambos formatos
        const match = item.bonus.match(/^(.+?)\s*:\s*(\d+)$/);
        if (match) {
          const originalName = match[1].trim(); // "Sword Fighting"
          const normalizedName = originalName.toLowerCase(); // "sword fighting"
          const value = parseInt(match[2], 10);
          stats[normalizedName] = (stats[normalizedName] || 0) + value;
        } else {
          const match2 = item.bonus.match(/^(.+?)\s?\+?(\d+)$/);
          if (match2) {
            const originalName = match2[1].trim(); // "Magic Level"
            const normalizedName = originalName.toLowerCase(); // "magic level"
            const value = parseInt(match2[2], 10);
            stats[normalizedName] = (stats[normalizedName] || 0) + value;
          } else {
            // Non-numeric bonus like "Regeneration" or "Fire Attack"
            flags.add(item.bonus);
          }
        }
      }
    }

    // 2. Parse Protections
    if (item.protection) {
      // Regex for "Name +Amount%" or "Name Amount%" (e.g. "Fire +5%", "Drunk 100%", "All +20%")
      const match = item.protection.match(/^(.+?)\s?\+?(\d+)%?$/);
      if (match) {
        const name = match[1].trim();
        const value = parseInt(match[2], 10);

        if (name.toLowerCase() === 'all') {
          // If "All", add value to every elemental protection
          TIBIA_ELEMENTS.forEach(element => {
            protections[element] = (protections[element] || 0) + value;
          });
        } else {
          // Specific protection (e.g. "Fire", "Drunk")
          protections[name] = (protections[name] || 0) + value;
        }
      }
    }
  });

  return { stats, flags: Array.from(flags), protections };
};

// Helper to get color style based on stat name
const getStatStyle = (statName: string) => {
  const lower = statName.toLowerCase();

  // Elements
  if (lower.includes('fire')) return 'text-orange-400 border-orange-500/30';
  if (lower.includes('ice')) return 'text-cyan-300 border-cyan-500/30';
  if (lower.includes('energy')) return 'text-purple-400 border-purple-500/30';
  if (lower.includes('earth') || lower.includes('terra')) return 'text-emerald-400 border-emerald-500/30';
  if (lower.includes('death')) return 'text-gray-400 border-gray-500/30';
  if (lower.includes('holy')) return 'text-yellow-200 border-yellow-500/30';
  if (lower.includes('physical')) return 'text-slate-400 border-slate-500/30';

  // Skills
  if (lower.includes('sword') || lower.includes('axe') || lower.includes('club') || lower.includes('fist')) {
    return 'text-red-300 border-red-500/30';
  }
  if (lower.includes('distance') || lower.includes('hit%')) {
    return 'text-green-300 border-green-500/30';
  }
  if (lower.includes('shielding')) {
    return 'text-slate-300 border-slate-500/30';
  }
  if (lower.includes('magic')) {
    return 'text-purple-300 border-purple-500/30';
  }
  if (lower.includes('speed')) {
    return 'text-yellow-300 border-yellow-500/30';
  }

  // Default
  return 'text-yellow-300 border-yellow-500/30';
};

const InfoPanel: React.FC<InfoPanelProps> = ({ items }) => {
  // Calculate Totals
  const equippedList = Object.values(items).filter((i): i is Item => i !== null && i !== undefined);

  // Basic Stats
  const totalArmor = equippedList.reduce((sum, item) => sum + (item.armor || 0), 0);
  const weapon = items[SlotType.WEAPON];
  const ammo = items[SlotType.AMMO];
  const totalAttack = (weapon?.attack || 0) + (ammo?.attack || 0);
  const shield = items[SlotType.SHIELD];
  const defenseItem = shield || weapon;
  const totalDefense = defenseItem?.defense || 0;

  // Aggregated Dynamic Stats
  const { stats, flags, protections } = aggregateStats(equippedList);

  const isEmpty = equippedList.length === 0;
  const hasBonuses = Object.keys(stats).length > 0 || flags.length > 0;
  const hasProtections = Object.keys(protections).length > 0;

  return (
    <div className="h-full w-full flex flex-col bg-slate-900/50 backdrop-blur-sm relative overflow-hidden">
      {/* Decorative Border Line Left */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent opacity-50 z-20"></div>

      {/* 1. HEADER (Fixed) */}
      <div className="shrink-0 p-6 pb-4 border-b border-slate-800/60 z-10 bg-slate-900/20">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl text-yellow-500 rpg-font tracking-wide drop-shadow-sm">Set Details</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">Combat Statistics</p>
          </div>
          <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[10px] text-slate-400 font-mono">
            {equippedList.length} Items
          </div>
        </div>
      </div>
      
      {/* Content Area */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-60 p-6">
           <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
           </div>
          <p className="text-sm font-medium tracking-wide">Equip items to analyze build</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          {/* 2. STATS SECTION (Fixed, does not scroll) */}
          <div className="shrink-0 p-6 pb-2 space-y-4">
            
            {/* ROW 1: Main Stats (Armor, Attack, Defense) */}
            <div className="grid grid-cols-3 gap-3">
              {/* Armor Card */}
              <div className="relative group overflow-hidden bg-gradient-to-br from-slate-800 to-slate-800/60 p-3 rounded border border-slate-700/60 shadow-lg flex flex-col items-center justify-center min-h-[80px]">
                 <div className="absolute top-0 w-full h-0.5 bg-blue-500/50"></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Armor</span>
                 <div className="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500/80" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                   </svg>
                   <span className="text-2xl font-bold text-white tabular-nums drop-shadow-md">{totalArmor}</span>
                 </div>
              </div>

              {/* Attack Card */}
              <div className="relative group overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-3 rounded border border-slate-700/60 shadow-lg flex flex-col items-center justify-center min-h-[80px]">
                 <div className="absolute top-0 w-full h-0.5 bg-red-500/50"></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Attack</span>
                 <div className="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500/80" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                   </svg>
                   <span className="text-2xl font-bold text-white tabular-nums drop-shadow-md">{totalAttack}</span>
                 </div>
              </div>

              {/* Defense Card */}
              <div className="relative group overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-3 rounded border border-slate-700/60 shadow-lg flex flex-col items-center justify-center min-h-[80px]">
                 <div className="absolute top-0 w-full h-0.5 bg-green-500/50"></div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Defense</span>
                 <div className="flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500/80" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </svg>
                   <span className="text-2xl font-bold text-white tabular-nums drop-shadow-md">{totalDefense}</span>
                 </div>
              </div>
            </div>

            {/* ROW 2: Dynamic Stats (Split Columns) */}
            {(hasBonuses || hasProtections) && (
              <div className="grid grid-cols-2 gap-4 animate-fadeIn mt-4">
                
                {/* COLUMN 1: SKILLS & ATTRIBUTES */}
                <div className="flex flex-col gap-2">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-800 pb-1">
                     Skills & Attributes
                   </div>
                   
                   {/* Numeric Bonuses */}
                   {Object.entries(stats).map(([name, value]) => {
                      // Converter de volta para Title Case para exibição
                      const displayName = name
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                      const colorStyle = getStatStyle(displayName);
                      return (
                        <div key={name} className={`bg-slate-800/40 border rounded p-2 flex items-center justify-between shadow-sm ${colorStyle.split(' ')[1].replace('text-', 'border-')}`}>
                           <span className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold tracking-wider">{displayName}</span>
                           <span className={`font-bold text-sm ${colorStyle.split(' ')[0]}`}>+{value}</span>
                        </div>
                      );
                   })}

                    {/* Text Flags (Regeneration, Elements, etc) */}
                    {flags.map((flag) => {
                       const style = getStatStyle(flag);
                       const borderColor = style.split(' ')[1].replace('text-', 'border-');
                       const textColor = style.split(' ')[0];
                       
                       return (
                        <div key={flag} className={`bg-slate-800/40 border rounded p-2 flex items-center justify-between shadow-sm ${borderColor}`}>
                           <span className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold tracking-wider">{flag}</span>
                           <span className={`font-bold text-sm ${textColor}`}>Active</span>
                        </div>
                      );
                    })}
                    
                    {!hasBonuses && (
                       <div className="h-full flex items-center justify-center p-4 border border-slate-800/30 rounded border-dashed text-[10px] text-slate-600">
                         No active bonuses
                       </div>
                    )}
                </div>

                {/* COLUMN 2: DAMAGE REDUCTION */}
                <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-800 pb-1">
                      Damage Reduction
                    </div>
                    
                    {/* Protections - Sorted Alphabetically */}
                    {Object.entries(protections).sort((a,b) => a[0].localeCompare(b[0])).map(([name, value]) => (
                       <div key={name} className="bg-slate-800/40 border border-slate-700/50 rounded p-2 flex items-center justify-between shadow-sm">
                          <span className="text-[9px] md:text-[10px] uppercase text-slate-400 font-bold tracking-wider">{name}</span>
                          <span className="font-bold text-sm text-teal-300">{value}%</span>
                       </div>
                    ))}

                    {!hasProtections && (
                       <div className="h-full flex items-center justify-center p-4 border border-slate-800/30 rounded border-dashed text-[10px] text-slate-600">
                         No protections
                       </div>
                    )}
                </div>

              </div>
            )}

          </div>

          {/* 3. LOG LABEL (Fixed, does not scroll) */}
          <div className="shrink-0 px-6 py-2 mt-2">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-800">Inventory Log</h3>
          </div>

          {/* 4. INVENTORY LOG LIST (Scrollable, takes remaining space) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 h-[300px] md:h-auto min-h-0">
            <div className="space-y-2 pb-6">
              {equippedList.map((item) => (
                <div key={item.id} className="group flex flex-col p-2 pl-3 rounded bg-slate-800/40 border border-slate-800 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                          <img src={item.image} alt={item.name} className="w-6 h-6 object-contain pixelated" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate block">
                        {item.slot === 'extra-slot' ? 'Atributos: ' : ''}
                        {item.name}
                      </span>
                        {/* Bonuses in Log */}
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {item.bonus && (
                            <span className="text-[9px] text-purple-300 bg-purple-900/30 px-1 rounded border border-purple-500/20">{item.bonus}</span>
                          )}
                          {item.protection && (
                            <span className="text-[9px] text-teal-300 bg-teal-900/30 px-1 rounded border border-teal-500/20">{item.protection}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Compact Stats */}
                    <div className="flex items-center gap-3 pr-2 text-xs font-mono opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                      {item.attack && (
                        <div className="flex items-center text-red-400" title="Attack">
                          <span className="font-bold">{item.attack}</span>
                          <span className="ml-0.5 text-[9px] uppercase">Atk</span>
                        </div>
                      )}
                      {item.defense > 0 && (
                        <div className="flex items-center text-green-400" title="Defense">
                          <span className="font-bold">{item.defense}</span>
                          <span className="ml-0.5 text-[9px] uppercase">Def</span>
                        </div>
                      )}
                      {item.armor > 0 && (
                        <div className="flex items-center text-blue-400" title="Armor">
                          <span className="font-bold">{item.armor}</span>
                          <span className="ml-0.5 text-[9px] uppercase">Arm</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default InfoPanel;