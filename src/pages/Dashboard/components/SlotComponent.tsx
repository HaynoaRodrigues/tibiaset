import React from 'react';
import { Item, SlotType, Vocation } from '../../../types/infotypes';

interface SlotComponentProps {
  slotType: SlotType;
  item: Item | null | undefined;
  onClick: () => void;
  onRemove?: () => void;
  selectedVocation?: Vocation;
  getSlotDisplayName?: (slotType: SlotType, vocation: Vocation) => string;
  monkWeaponItem?: Item | null;
  isReadOnly?: boolean;
}

const SlotComponent: React.FC<SlotComponentProps> = ({ slotType, item, onClick, onRemove, selectedVocation, getSlotDisplayName, monkWeaponItem, isReadOnly = false }) => {
  // Para o Monk, o slot de escudo mostra visualmente a mesma arma do slot de arma
  const displayItem = (selectedVocation === 'Exalted Monk' && slotType === SlotType.SHIELD && monkWeaponItem) ?
    monkWeaponItem : item;
  return (
    <div 
      onClick={isReadOnly ? undefined : onClick}
      className={`
        relative w-16 h-16 md:w-[84px] md:h-[84px]
        group ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} transition-all duration-300
        flex items-center justify-center
      `}
      title={`Slot: ${slotType === 'extra-slot' ? 'Atributos' : slotType}`}
    >
      {/* Outer Glow/Border Effect on Hover */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-slate-700/50 group-hover:border-yellow-500/40 group-hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all duration-300"></div>

      {/* Background Icon for Empty State */}
      {!item && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none group-hover:opacity-10 transition-opacity">
           <div className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full h-full p-1.5 flex items-center justify-center">
        {displayItem ? (
          <img
            src={displayItem.image}
            alt={displayItem.name}
            className={`w-full h-full object-contain filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:scale-110 pixelated ${
              (slotType === SlotType.SHIELD && selectedVocation === 'Exalted Monk') ? 'opacity-30' : ''
            }`}
          />
        ) : (
          <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest opacity-40 select-none group-hover:text-yellow-500/60 transition-colors">
            {getSlotDisplayName && selectedVocation ? getSlotDisplayName(slotType, selectedVocation) :
             slotType === 'amulet' ? 'NECK' :
             slotType === 'backpack' ? 'BACK' :
             slotType === 'extra-slot' ? 'ATRB' :
             slotType.substring(0, 4)}
          </span>
        )}
      </div>

      {/* Selection Indicator Corner (Decorative) */}
      {!item && (
        <>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-lg"></div>
        </>
      )}

      {/* Remove Button (X) - Only visible on hover if item exists and not in read-only mode */}
      {displayItem && onRemove && !isReadOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent opening the modal
            onRemove();
          }}
          className="absolute -top-1 -right-1 z-30 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200/90 border border-slate-400 text-slate-400 hover:text-white hover:bg-red-600 hover:border-red-700 transition-all opacity-0 group-hover:opacity-100 shadow-md scale-90 hover:scale-110"
          title="Unequip Item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SlotComponent;