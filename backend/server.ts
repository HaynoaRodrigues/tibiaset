import express from 'express';
import cors from 'cors';
import routes from './routes';
import dotenv from 'dotenv';
import { cacheCleanupMiddleware, startPeriodicCacheUpdates, registerCacheUpdateFunction } from './utils/globalCache';
import supabase from './routes/db';

dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 5757;

// Middleware para parsing de JSON
app.use(express.json());

// Configuração de CORS
app.use(cors());

// Middleware para limpeza de cache expirado
app.use(cacheCleanupMiddleware());

// Usar as rotas definidas
app.use('/api', routes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do Tibia Set Builder!' });
});

// Funções para atualizar caches específicos
const updateArmorCache = async () => {
  const { data, error } = await supabase
    .from('armor')
    .select('*')
    .eq('ativo', true);

  if (error) {
    throw new Error(`Erro ao atualizar cache de armaduras: ${error.message}`);
  }

  return data;
};

const updateHelmetCache = async () => {
  const { data, error } = await supabase
    .from('helmet')
    .select('*')
    .eq('ativo', true);

  if (error) {
    throw new Error(`Erro ao atualizar cache de capacetes: ${error.message}`);
  }

  return data;
};

// Registrar as funções de atualização de cache
registerCacheUpdateFunction('armor', updateArmorCache);
registerCacheUpdateFunction('helmet', updateHelmetCache);

// Middleware de tratamento de erros
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Rota 404 para rotas não definidas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  // Iniciar atualizações periódicas de cache após o servidor iniciar
  startPeriodicCacheUpdates(10080); // Atualiza a cada 1 semana (7 dias * 24 horas * 60 minutos = 10080 minutos)
});

export default app;