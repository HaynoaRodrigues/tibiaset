import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { EquippedItems, Vocation, SlotType } from '../../types/infotypes';
import SlotComponent from '../Dashboard/components/SlotComponent';
import InfoPanel from '../Dashboard/components/InfoPanel';
import { getSlotDisplayName } from '../Dashboard/utils/slotUtils';

interface ShareSetData {
  items: EquippedItems;
  vocation: Vocation;
  setName: string;
  createdAt: Date;
}

// Simulação de armazenamento local para demonstração
// Em uma aplicação real, isso viria de uma API
const mockSharedSets: Record<string, ShareSetData> = {};

const SharedSetView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<ShareSetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Em uma implementação real, buscaríamos os dados da API
    // const fetchSharedSet = async () => {
    //   try {
    //     const response = await fetch(`/api/shared-sets/${id}`);
    //     if (!response.ok) throw new Error('Set não encontrado');
    //     const data = await response.json();
    //     setSet(data);
    //     setLoading(false);
    //   } catch (err) {
    //     setError('Falha ao carregar o set compartilhado');
    //     setLoading(false);
    //   }
    // };

    // Para demonstração, vamos tentar recuperar dados do localStorage ou usar dados padrão
    const storedSets = localStorage.getItem('sharedSets');
    const sets = storedSets ? JSON.parse(storedSets) : {};
    
    if (sets[id]) {
      // Dados reais do set compartilhado (simulado via localStorage)
      setSet({
        items: sets[id].items,
        vocation: sets[id].vocation,
        setName: sets[id].setName || `Set Compartilhado - ${id}`,
        createdAt: new Date(sets[id].createdAt)
      });
      setLoading(false);
    } else {
      // Se não encontrar, usar dados de exemplo
      setTimeout(() => {
        if (id) {
          // Dados de exemplo para demonstração
          setSet({
            items: {},
            vocation: Vocation.KNIGHT,
            setName: `Set Compartilhado - ${id}`,
            createdAt: new Date()
          });
          setLoading(false);
        } else {
          setError('ID do set não especificado');
          setLoading(false);
        }
      }, 500);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-grid-pattern relative overflow-y-auto overflow-x-hidden">
        <div className="text-center">
          <p className="text-slate-400">Carregando set compartilhado...</p>
        </div>
      </div>
    );
  }

  if (error || !set) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-grid-pattern relative overflow-y-auto overflow-x-hidden">
        <div className="text-center">
          <p className="text-red-400">{error || 'Set não encontrado'}</p>
          <a href="/" className="mt-4 px-4 py-2 bg-slate-700 text-white rounded inline-block">
            Voltar para Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-grid-pattern relative overflow-y-auto overflow-x-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-900/80 to-slate-950"></div>

      {/* Navbar */}
      <nav className="w-full max-w-6xl mb-2 z-30">
        <div className="flex justify-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 px-6 py-3 flex items-center">
            <span className="text-slate-300 text-sm mr-2">Seu próximo set pode mudar toda a sua hunt. Quer montar um?</span>
            <a
              href="/"
              className="text-yellow-400 hover:text-yellow-300 text-sm font-bold underline transition-colors"
            >
              Comece agora!
            </a>
          </div>
        </div>
      </nav>

      {/* Main App Container */}
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-5 gap-0 bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 h-auto relative z-10 ring-1 ring-white/5">

        {/* Left Section: Character & Equipment */}
        <div className="col-span-1 md:col-span-3 p-6 md:p-10 flex flex-col items-center relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

          {/* Header Area */}
          <div className="w-full flex justify-between items-center mb-8 relative z-10">
             <div className="flex flex-col">
                <h1 className="text-3xl text-slate-200 rpg-font font-bold tracking-widest drop-shadow-lg">{set.setName}</h1>
                <span className="text-xs text-yellow-600 uppercase tracking-[0.2em] font-semibold">Tibia Set Builder</span>
             </div>
          </div>

          {/* Vocation Display */}
          <div className="w-full max-w-2xl mb-10 z-10">
            <div className="bg-slate-950/50 p-1 rounded-lg border border-slate-800 flex justify-center shadow-inner">
              <div className="py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-md bg-gradient-to-b from-slate-700 to-slate-800 text-yellow-400 shadow-lg ring-1 ring-slate-600">
                {set.vocation}
                <div className="h-0.5 w-4 bg-yellow-500 mx-auto mt-1 rounded-full shadow-[0_0_5px_rgba(234,179,8,0.8)]"></div>
              </div>
            </div>
          </div>

          {/* Compartilhar informações - REMOVIDO conforme solicitado */}

          {/* Equipment Grid */}
          <div className="relative p-6 md:p-8 bg-slate-800/40 rounded-xl border border-slate-700/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 md:gap-5 relative z-10">
              <div className="flex justify-center items-center">
                <SlotComponent 
                  slotType={SlotType.AMULET} 
                  item={set.items[SlotType.AMULET]} 
                  onClick={() => {}} 
                  onRemove={() => {}} 
                  selectedVocation={set.vocation} 
                  getSlotDisplayName={getSlotDisplayName} 
                  isReadOnly={true}
                />
              </div>
              <div className="flex justify-center items-center">
                <SlotComponent 
                  slotType={SlotType.HELMET} 
                  item={set.items[SlotType.HELMET]} 
                  onClick={() => {}} 
                  onRemove={() => {}} 
                  selectedVocation={set.vocation} 
                  getSlotDisplayName={getSlotDisplayName} 
                  isReadOnly={true}
                />
              </div>
              {/* não remover essa linha abaixo comentada */}
              {/* <div className="flex justify-center items-center"><SlotComponent slotType={SlotType.HELMET} item={set.items[SlotType.HELMET]} onClick={() => {}} onRemove={() => {}} selectedVocation={set.vocation} getSlotDisplayName={getSlotDisplayName} isReadOnly={true} /></div> */}
              <div className="flex justify-center items-center"></div>

              <div className="flex justify-center items-center">
                <SlotComponent 
                  slotType={SlotType.WEAPON} 
                  item={set.items[SlotType.WEAPON]} 
                  onClick={() => {}} 
                  onRemove={() => {}} 
                  selectedVocation={set.vocation} 
                  getSlotDisplayName={getSlotDisplayName} 
                  monkWeaponItem={set.items[SlotType.WEAPON]}
                  isReadOnly={true}
                />
              </div>
              <div className="flex justify-center items-center">
                <SlotComponent 
                  slotType={SlotType.ARMOR} 
                  item={set.items[SlotType.ARMOR]} 
                  onClick={() => {}} 
                  onRemove={() => {}} 
                  selectedVocation={set.vocation} 
                  getSlotDisplayName={getSlotDisplayName} 
                  isReadOnly={true}
                />
              </div>
              <div className="flex justify-center items-center">
                <SlotComponent 
                  slotType={SlotType.SHIELD} 
                  item={set.items[SlotType.SHIELD]} 
                  onClick={() => {}} 
                  onRemove={() => {}} 
                  selectedVocation={set.vocation} 
                  getSlotDisplayName={getSlotDisplayName} 
                  monkWeaponItem={set.items[SlotType.WEAPON]}
                  isReadOnly={true}
                />
              </div>

              <div className="flex justify-center items-center">
                <SlotComponent 
                  slotType={SlotType.RING} 
                  item={set.items[SlotType.RING]} 
                  onClick={() => {}} 
                  onRemove={() => {}} 
                  selectedVocation={set.vocation} 
                  getSlotDisplayName={getSlotDisplayName} 
                  isReadOnly={true}
                />
              </div>
              <div className="flex justify-center items-center">
                <SlotComponent 
                  slotType={SlotType.LEGS} 
                  item={set.items[SlotType.LEGS]} 
                  onClick={() => {}} 
                  onRemove={() => {}} 
                  selectedVocation={set.vocation} 
                  getSlotDisplayName={getSlotDisplayName} 
                  isReadOnly={true}
                />
              </div>
              <div className="flex justify-center items-center">
                <SlotComponent 
                  slotType={SlotType.EXTRA_SLOT} 
                  item={set.items[SlotType.EXTRA_SLOT]} 
                  onClick={() => {}} 
                  onRemove={() => {}} 
                  selectedVocation={set.vocation} 
                  getSlotDisplayName={getSlotDisplayName} 
                  isReadOnly={true}
                />
              </div>

              <div className="col-start-2 flex justify-center items-center pt-1">
                <SlotComponent 
                  slotType={SlotType.BOOTS} 
                  item={set.items[SlotType.BOOTS]} 
                  onClick={() => {}} 
                  onRemove={() => {}} 
                  selectedVocation={set.vocation} 
                  getSlotDisplayName={getSlotDisplayName} 
                  isReadOnly={true}
                />
              </div>
            </div>
          </div>

          {/* Botão Copiar Link - abaixo do card de equipamentos, no canto inferior direito da coluna esquerda */}
          <div className="absolute bottom-6 right-6 z-20">
            <button
              className="px-4 py-2 text-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold rounded-lg shadow-lg border border-yellow-500/50 transition-all transform hover:scale-105"
              onClick={() => {
                const shareUrl = `${window.location.origin}/share/${id}`;
                navigator.clipboard.writeText(shareUrl);
                alert('Link copiado para a área de transferência!');
              }}
            >
              Copiar Link
            </button>
          </div>
        </div>

        {/* Right Section: Set Info Panel */}
        <div className="col-span-1 md:col-span-2 h-full min-h-0">
          <InfoPanel items={set.items} />
        </div>
      </div>
    </div>
  );
};

export default SharedSetView;