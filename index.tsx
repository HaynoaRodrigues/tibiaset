import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './src/pages/Dashboard/DashboardPage';
import ShareSetPage from './src/pages/ShareSet/ShareSetPage';

const container = document.getElementById('root');
const root = createRoot(container!);

// Renderizando a aplicação com roteamento
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="font-sans antialiased bg-[#0b0f19] text-slate-200 min-h-screen">
            <DashboardPage />
          </div>
        } />
        <Route path="/share/:id" element={
          <div className="font-sans antialiased bg-[#0b0f19] text-slate-200 min-h-screen">
            <ShareSetPage
              setItems={{}}
              vocation={null as any} // Será substituído pelos dados reais
              setName="Set Compartilhado"
            />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);