import React, { useEffect, useState } from 'react';
import { Item, SlotType, Vocation } from '../../../types/infotypes';
import { fetchItemsByVocationAndSlot } from '../../../services/apiService';

interface ItemModalProps {
  isOpen: boolean;
  slotType: SlotType | null;
  selectedVocation: Vocation;
  onClose: () => void;
  onSelect: (item: Item) => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ isOpen, slotType, selectedVocation, onClose, onSelect }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (isOpen && slotType) {
      console.log(`ItemModal aberto para slot: ${slotType} e vocação: ${selectedVocation}`);
      const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
          console.log('Iniciando fetch de itens...');
          const fetchedItems = await fetchItemsByVocationAndSlot(selectedVocation, slotType);
          console.log(`Itens recebidos no ItemModal: ${fetchedItems.length}`);
          setItems(fetchedItems);
          setFilteredItems(fetchedItems); // Inicialmente mostra todos os itens
        } catch (err) {
          setError('Failed to load items');
          console.error('Error fetching items:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchItems();
    } else {
      console.log('ItemModal fechado ou slotType nulo');
      setItems([]);
      setFilteredItems([]);
      setSearchTerm('');
    }
  }, [isOpen, slotType, selectedVocation]);

  // Função para filtrar os itens com base no termo de busca
  useEffect(() => {
    if (items.length > 0) {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm, items]);

  if (!isOpen || !slotType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-slate-800 border-2 border-slate-600 rounded-lg shadow-2xl w-full max-w-6xl flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/50 rounded-t-lg">
          <div className="flex-1">
             <h3 className="text-lg font-bold text-slate-200 capitalize">
               {slotType === 'weapon' ?
                 (selectedVocation === 'Elite Knight' ? 'Select Melee Weapon' :
                  selectedVocation === 'Royal Paladin' ? 'Select Distance Weapon' :
                  selectedVocation === 'Master Sorcerer' ? 'Select Wand' :
                  selectedVocation === 'Elder Druid' ? 'Select Rod' :
                  selectedVocation === 'Exalted Monk' ? 'Select Fist Weapon' :
                  'Select Weapon') :
                slotType === 'shield' ?
                  (selectedVocation === 'Elite Knight' ? 'Select Shield' :
                   selectedVocation === 'Royal Paladin' ? 'Select Quiver' :
                   selectedVocation === 'Exalted Monk' ? 'Select Fist Weapon (Shield Slot)' :
                   'Select Shield/Book') : `Select ${slotType}`}
             </h3>
             <span className="text-xs text-yellow-500 font-mono tracking-wide">{selectedVocation}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-slate-200 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Grid - 3 itens por linha */}
        <div className="overflow-y-auto p-2 flex-1 custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">Loading items...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-400">Error loading items</p>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <span className="text-4xl mb-3">🛡️</span>
              <p className="text-slate-400 font-medium">
                {items.length === 0 ? 'No items available.' : 'No items match your search.'}
              </p>
              {items.length === 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  There are no {slotType}s available for <br/> <span className="text-yellow-500/80">{selectedVocation}</span> in the database.
                </p>
              )}
              {items.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search term.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="flex items-center p-3 rounded hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-600 text-left group"
                >
                  <div className="w-28 h-28 bg-slate-900 rounded border border-slate-700 flex-shrink-0 mr-4 flex items-center justify-center overflow-hidden">
                     <img
                        src={item.image}
                        alt={item.name}
                        style={{ imageRendering: 'pixelated' }}
                        className="w-[50%] h-[50%] group-hover:scale-110 transition-transform"
                     />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-200 font-semibold group-hover:text-yellow-400 transition-colors text-sm truncate">{item.name}</p>
                    </div>

                    {/* Stats Row - Exibe informações relevantes baseado no tipo de slot */}
                    {slotType !== SlotType.EXTRA_SLOT && (
                      <p className="text-xs text-slate-400 mb-1 truncate">
                        {item.attack !== null && item.attack !== undefined && item.attack !== 0 ?
                          <span className="mr-1">Atk: <span className="text-red-300">{item.attack}</span> </span> : null}
                        {item.defense !== null && item.defense !== undefined && item.defense > 0 ?
                          <span className="mr-1">Def: <span className="text-slate-300">{item.defense}</span> </span> : null}
                        <span>Arm: <span className="text-slate-300">{item.armor || 0}</span></span>
                      </p>
                    )}
                    {/* Duration */}
                    {item.duration !== null && item.duration !== undefined && item.duration > 0 &&
                      <p className="text-xs text-slate-400 mb-1 truncate">
                        <span>Duration: <span className="text-blue-300">{item.duration} min</span></span>
                      </p>
                    }

                    {/* Bonus/Protection Badges */}
                    <div className="flex flex-wrap gap-1">
                      {item.bonus && item.bonus !== '{}' && (
                        <span className="text-[9px] bg-purple-900/40 text-purple-200 px-1 py-0.5 rounded border border-purple-500/30 whitespace-nowrap" title={item.bonus}>
                          {item.bonus}
                        </span>
                      )}
                      {item.protection && item.protection !== '{}' && (
                        <span className="text-[9px] bg-teal-900/40 text-teal-200 px-1 py-0.5 rounded border border-teal-500/30 whitespace-nowrap" title={item.protection}>
                          {item.protection}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemModal;