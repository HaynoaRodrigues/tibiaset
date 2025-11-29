import React, { useEffect, useState } from 'react';
import { Item, SlotType, Vocation } from '../src/types/infotypes';
import { fetchItemsByVocationAndSlot } from '../src/services/apiService';

interface ItemModalProps {
  isOpen: boolean;
  slotType: SlotType | null;
  selectedVocation: Vocation;
  onClose: () => void;
  onSelect: (item: Item) => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ isOpen, slotType, selectedVocation, onClose, onSelect }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && slotType) {
      const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
          const fetchedItems = await fetchItemsByVocationAndSlot(selectedVocation, slotType);
          setItems(fetchedItems);
        } catch (err) {
          setError('Failed to load items');
          console.error('Error fetching items:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchItems();
    } else {
      setItems([]);
    }
  }, [isOpen, slotType, selectedVocation]);

  if (!isOpen || !slotType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 border-2 border-slate-600 rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-lg">
          <div>
             <h3 className="text-lg font-bold text-slate-200 capitalize">Select {slotType}</h3>
             <span className="text-xs text-yellow-500 font-mono tracking-wide">{selectedVocation}</span>
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

        {/* List */}
        <div className="overflow-y-auto p-2 space-y-2 flex-1 custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">Loading items...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-400">Error loading items</p>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <span className="text-4xl mb-3">🛡️</span>
              <p className="text-slate-400 font-medium">No items available.</p>
              <p className="text-xs text-slate-500 mt-1">
                There are no {slotType}s available for <br/> <span className="text-yellow-500/80">{selectedVocation}</span> in the database.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full flex items-center p-3 rounded hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-600 text-left group"
              >
                <div className="w-12 h-12 bg-slate-900 rounded border border-slate-700 flex-shrink-0 mr-4 flex items-center justify-center overflow-hidden">
                   <img
                      src={item.image}
                      alt={item.name}
                      style={{ imageRendering: 'pixelated' }}
                      className="max-w-full max-h-full group-hover:scale-110 transition-transform"
                   />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-slate-200 font-semibold group-hover:text-yellow-400 transition-colors">{item.name}</p>
                  </div>

                  {/* Stats Row */}
                  <p className="text-xs text-slate-400 mb-1">
                    {item.attack ? <span className="mr-2">Atk: <span className="text-red-300">{item.attack}</span></span> : null}
                    {item.defense > 0 && <span>Def: <span className="text-slate-300">{item.defense}</span> <span className="mx-1">|</span></span>}
                    Arm: <span className="text-slate-300">{item.armor}</span>
                  </p>

                  {/* Bonus/Protection Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.bonus && (
                      <span className="text-[10px] bg-purple-900/40 text-purple-200 px-1.5 py-0.5 rounded border border-purple-500/30">
                        {item.bonus}
                      </span>
                    )}
                    {item.protection && (
                      <span className="text-[10px] bg-teal-900/40 text-teal-200 px-1.5 py-0.5 rounded border border-teal-500/30">
                        {item.protection}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-slate-600 group-hover:text-yellow-500">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemModal;