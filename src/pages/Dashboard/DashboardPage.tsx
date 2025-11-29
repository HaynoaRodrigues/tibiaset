'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item, SlotType, EquippedItems, Vocation } from '../../types/infotypes';
import SlotComponent from './components/SlotComponent';
import ItemModal from './components/ItemModal';
import InfoPanel from './components/InfoPanel';
import WarningModal from '../../components/WarningModal';
import ShareSetModal from './components/ShareSetModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<EquippedItems>({});
  const [activeSlotModal, setActiveSlotModal] = useState<SlotType | null>(null);
  const [selectedVocation, setSelectedVocation] = useState<Vocation>(Vocation.KNIGHT);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // Função para mapear slots com base na vocação
  const getWeaponSlotType = (vocation: Vocation): SlotType => {
    switch(vocation) {
      case Vocation.KNIGHT:
        return SlotType.WEAPON; // Espadas, machados, clavas
      case Vocation.PALADIN:
        return SlotType.WEAPON; // Armas de distância (arco, besta)
      case Vocation.SORCERER:
        return SlotType.WEAPON; // Varinhas
      case Vocation.DRUID:
        return SlotType.WEAPON; // Varas mágicas
      case Vocation.MONK:
        return SlotType.WEAPON; // Fist fighting (mão livre)
      default:
        return SlotType.WEAPON;
    }
  };

  const getShieldSlotType = (vocation: Vocation): SlotType => {
    switch(vocation) {
      case Vocation.KNIGHT:
        return SlotType.SHIELD; // Escudos
      case Vocation.PALADIN:
        return SlotType.SHIELD; // Quivers (embora na UI apareça como shield slot)
      case Vocation.SORCERER:
        return SlotType.SHIELD; // Spellbooks
      case Vocation.DRUID:
        return SlotType.SHIELD; // Spellbooks
      case Vocation.MONK:
        return SlotType.WEAPON; // Para Monk, o slot de escudo será usado para a mesma arma (fist)
      default:
        return SlotType.SHIELD;
    }
  };

  // Função para obter o nome exibido do slot com base na vocação
  const getSlotDisplayName = (slotType: SlotType, vocation: Vocation): string => {
    if (slotType === SlotType.WEAPON) {
      switch(vocation) {
        case Vocation.KNIGHT:
          return 'MELEE';
        case Vocation.PALADIN:
          return 'DIST';
        case Vocation.SORCERER:
          return 'WAND';
        case Vocation.DRUID:
          return 'ROD';
        case Vocation.MONK:
          return 'FIST';
        default:
          return 'WEAP';
      }
    } else if (slotType === SlotType.SHIELD) {
      switch(vocation) {
        case Vocation.KNIGHT:
          return 'SHLD';
        case Vocation.PALADIN:
          return 'QUIV';
        case Vocation.SORCERER:
        case Vocation.DRUID:
          return 'SPLB';
        case Vocation.MONK:
          return 'FIST'; // Para Monk, o slot de escudo também mostra FIST
        default:
          return 'SHLD';
      }
    }
    // Para outros slots, retornar o padrão
    return slotType === 'amulet' ? 'NECK' :
           slotType === 'backpack' ? 'BACK' :
           slotType === 'extra-slot' ? 'ATRB' :
           slotType.substring(0, 4);
  };

  // Warning System State
  const [pendingVocation, setPendingVocation] = useState<Vocation | null>(null);
  const [suppressWarning, setSuppressWarning] = useState<boolean>(false);

  const handleSlotClick = (slot: SlotType) => {
    // Para os slots de arma e escudo, precisamos usar o slot apropriado com base na vocação
    if (slot === SlotType.WEAPON) {
      setActiveSlotModal(getWeaponSlotType(selectedVocation));
    } else if (slot === SlotType.SHIELD) {
      setActiveSlotModal(getShieldSlotType(selectedVocation));
    } else {
      setActiveSlotModal(slot);
    }
  };

  const handleItemSelect = (item: Item) => {
    setItems((prev) => ({
      ...prev,
      [item.slot]: item,
    }));
    setActiveSlotModal(null);
  };

  const handleRemoveItem = (slot: SlotType) => {
    setItems((prev) => {
      const newItems = { ...prev };

      // Para o Monk, remover do slot de escudo deve remover do slot de arma também
      if (selectedVocation === Vocation.MONK && slot === SlotType.SHIELD) {
        delete newItems[SlotType.WEAPON];
      } else {
        delete newItems[slot];
      }

      return newItems;
    });
  };

  const handleReset = () => {
    setItems({});
  };

  const handleVocationClick = (voc: Vocation) => {
    if (voc === selectedVocation) return;
    const hasItems = Object.keys(items).length > 0;

    if (!hasItems || suppressWarning) {
      setSelectedVocation(voc);
      setItems({});
    } else {
      setPendingVocation(voc);
    }
  };

  const handleConfirmVocationChange = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      setSuppressWarning(true);
    }
    if (pendingVocation) {
      setSelectedVocation(pendingVocation);
      setItems({});
      setPendingVocation(null);
    }
  };

  const handleCancelVocationChange = () => {
    setPendingVocation(null);
  };

  const handleShareSet = async () => {
    try {
      // Codificar os dados do set na URL
      const setData = {
        items,
        vocation: selectedVocation
      };

      // Converter para string e codificar para URL
      const dataString = JSON.stringify(setData);
      const encodedData = encodeURIComponent(dataString);

      // Gerar uma URL com os dados codificados
      const generatedShareUrl = `${window.location.origin}/share?data=${encodedData}`;

      // Definir a URL de compartilhamento e abrir o modal
      setShareUrl(generatedShareUrl);
      setIsShareModalOpen(true);

      // O botão 'Compartilhar Set' agora apenas abre o modal com a URL
      // A navegação permanece na mesma página
    } catch (error) {
      console.error('Erro ao compartilhar set:', error);
      alert('Erro ao compartilhar o set. Tente novamente.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsLinkCopied(true);

    // Resetar o estado após 2 segundos para que o usuário possa copiar novamente
    setTimeout(() => {
      setIsLinkCopied(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-grid-pattern relative overflow-y-auto overflow-x-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-900/80 to-slate-950"></div>

      {/* Main App Container */}
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-5 gap-0 bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 h-auto md:h-[800px] relative z-10 ring-1 ring-white/5">
        
        {/* Left Section: Character & Equipment */}
        <div className="col-span-1 md:col-span-3 p-6 md:p-10 flex flex-col items-center relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

          {/* Header Area */}
          <div className="w-full flex justify-between items-center mb-8 relative z-10">
             <div className="flex flex-col">
                <h1 className="text-3xl text-slate-200 rpg-font font-bold tracking-widest drop-shadow-lg">Equipment</h1>
                <span className="text-xs text-yellow-600 uppercase tracking-[0.2em] font-semibold">Tibia Set Builder</span>
             </div>
             <button
                onClick={handleReset}
                className="group px-4 py-2 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-xs font-bold rounded border border-red-900/50 hover:border-red-500/50 transition-all uppercase tracking-wider flex items-center gap-2"
              >
                <span>Reset</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
          </div>

          {/* Vocation Selector Tabs */}
          <div className="w-full max-w-2xl mb-10 z-10">
            <div className="bg-slate-950/50 p-1 rounded-lg border border-slate-800 flex justify-between shadow-inner">
              {Object.values(Vocation).map((voc) => {
                const isSelected = selectedVocation === voc;
                const shortName = voc.split(' ').pop();
                return (
                  <button
                    key={voc}
                    onClick={() => handleVocationClick(voc)}
                    className={`
                      flex-1 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300
                      ${isSelected
                        ? 'bg-gradient-to-b from-slate-700 to-slate-800 text-yellow-400 shadow-lg ring-1 ring-slate-600 transform scale-[1.02]'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }
                    `}
                  >
                    {shortName}
                    {isSelected && <div className="h-0.5 w-4 bg-yellow-500 mx-auto mt-1 rounded-full shadow-[0_0_5px_rgba(234,179,8,0.8)]"></div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment Grid */}
          <div className="relative p-6 md:p-8 bg-slate-800/40 rounded-xl border border-slate-700/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 md:gap-5 relative z-10">
              <div className="flex justify-center items-center"><SlotComponent slotType={SlotType.AMULET} item={items[SlotType.AMULET]} onClick={() => handleSlotClick(SlotType.AMULET)} onRemove={() => handleRemoveItem(SlotType.AMULET)} selectedVocation={selectedVocation} getSlotDisplayName={getSlotDisplayName} /></div>
              <div className="flex justify-center items-center"><SlotComponent slotType={SlotType.HELMET} item={items[SlotType.HELMET]} onClick={() => handleSlotClick(SlotType.HELMET)} onRemove={() => handleRemoveItem(SlotType.HELMET)} selectedVocation={selectedVocation} getSlotDisplayName={getSlotDisplayName} /></div>
              {/* não remover essa linha abaixo comentada */}
              {/* <div className="flex justify-center items-center"><SlotComponent slotType={SlotType.HELMET} item={items[SlotType.HELMET]} onClick={() => handleSlotClick(SlotType.HELMET)} onRemove={() => handleRemoveItem(SlotType.HELMET)} selectedVocation={selectedVocation} getSlotDisplayName={getSlotDisplayName} /></div> */}
              <div className="flex justify-center items-center"></div>

              <div className="flex justify-center items-center"><SlotComponent slotType={SlotType.WEAPON} item={items[SlotType.WEAPON]} onClick={() => handleSlotClick(SlotType.WEAPON)} onRemove={() => handleRemoveItem(SlotType.WEAPON)} selectedVocation={selectedVocation} getSlotDisplayName={getSlotDisplayName} monkWeaponItem={items[SlotType.WEAPON]} /></div>
              <div className="flex justify-center items-center"><SlotComponent slotType={SlotType.ARMOR} item={items[SlotType.ARMOR]} onClick={() => handleSlotClick(SlotType.ARMOR)} onRemove={() => handleRemoveItem(SlotType.ARMOR)} selectedVocation={selectedVocation} getSlotDisplayName={getSlotDisplayName} /></div>
              <div className="flex justify-center items-center"><SlotComponent slotType={SlotType.SHIELD} item={items[SlotType.SHIELD]} onClick={() => handleSlotClick(SlotType.SHIELD)} onRemove={() => handleRemoveItem(SlotType.SHIELD)} selectedVocation={selectedVocation} getSlotDisplayName={getSlotDisplayName} monkWeaponItem={items[SlotType.WEAPON]} /></div>

              <div className="flex justify-center items-center"><SlotComponent slotType={SlotType.RING} item={items[SlotType.RING]} onClick={() => handleSlotClick(SlotType.RING)} onRemove={() => handleRemoveItem(SlotType.RING)} selectedVocation={selectedVocation} getSlotDisplayName={getSlotDisplayName} /></div>
              <div className="flex justify-center items-center"><SlotComponent slotType={SlotType.LEGS} item={items[SlotType.LEGS]} onClick={() => handleSlotClick(SlotType.LEGS)} onRemove={() => handleRemoveItem(SlotType.LEGS)} selectedVocation={selectedVocation} getSlotDisplayName={getSlotDisplayName} /></div>
              <div className="flex justify-center items-center"><SlotComponent slotType={SlotType.EXTRA_SLOT} item={items[SlotType.EXTRA_SLOT]} onClick={() => handleSlotClick(SlotType.EXTRA_SLOT)} onRemove={() => handleRemoveItem(SlotType.EXTRA_SLOT)} selectedVocation={selectedVocation} getSlotDisplayName={getSlotDisplayName} /></div>

              <div className="col-start-2 flex justify-center items-center pt-1"><SlotComponent slotType={SlotType.BOOTS} item={items[SlotType.BOOTS]} onClick={() => handleSlotClick(SlotType.BOOTS)} onRemove={() => handleRemoveItem(SlotType.BOOTS)} selectedVocation={selectedVocation} getSlotDisplayName={getSlotDisplayName} /></div>
            </div>
          </div>

          {/* Botão Compartilhar Set - fora do card de equipamentos, no canto inferior direito da coluna esquerda */}
          <div className="absolute bottom-6 right-6 z-20">
            <button
              className="px-4 py-2 text-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold rounded-lg shadow-lg border border-yellow-500/50 transition-all transform hover:scale-105"
              onClick={() => handleShareSet()}
            >
              Compartilhar Set
            </button>
          </div>
        </div>

        {/* Right Section: Set Info Panel */}
        <div className="col-span-1 md:col-span-2 h-full min-h-0">
          <InfoPanel items={items} />
        </div>
      </div>

      <ItemModal isOpen={!!activeSlotModal} slotType={activeSlotModal} selectedVocation={selectedVocation} onClose={() => setActiveSlotModal(null)} onSelect={handleItemSelect} />
      <WarningModal isOpen={!!pendingVocation} title="Change Vocation?" message={`Switching to ${pendingVocation} will reset your current equipment set.`} onConfirm={handleConfirmVocationChange} onCancel={handleCancelVocationChange} />
      <ShareSetModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setIsLinkCopied(false); // Resetar o estado de cópia ao fechar o modal
        }}
        shareUrl={shareUrl}
        onCopy={handleCopyLink}
        isLinkCopied={isLinkCopied}
      />
    </div>
  );
}