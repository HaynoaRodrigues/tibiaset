# Documentação: Scraping e Inserção de Dados no Banco de Dados

## Introdução

Este documento descreve o processo de extração (scraping) de informações do Tibia Fandom e sua subsequente inserção no banco de dados Supabase. O processo foi projetado para contornar as proteções do Cloudflare e extrair dados estruturados de forma eficiente.

## Objetivo

O objetivo deste processo é:

1. Extrair informações de itens do jogo Tibia (armaduras, capacetes, escudos, etc.)
2. Converter os dados para o formato apropriado para o banco de dados
3. Inserir os dados no banco Supabase de forma segura e estruturada

## Arquitetura do Processo

O sistema é dividido em duas partes principais:

### 1. Frontend (Scraping)
- Localizado em `src/utils/scraping-api.ts`
- Responsável por extrair os dados do Tibia Fandom
- Utiliza a API do MediaWiki para contornar o Cloudflare

### 2. Backend (Banco de Dados)
- Localizado em `backend/database.ts`
- Responsável por inserir os dados no banco Supabase
- Utiliza a chave de serviço (service role) para operações administrativas

## Configuração de Ambiente

### Variáveis de Ambiente

#### Frontend (`.env`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://lzymiatuncxhstkilkrn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eW1pYXR1bmN4aHN0a2lsa3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDM1NzQsImV4cCI6MjA3OTcxOTU3NH0.U1d25zHg_R92KtUrWstrrKZVO6NP4vhVWZ2ojbR6K8o
```

#### Backend (`backend/.env`):
```bash
SUPABASE_URL=https://lzymiatuncxhstkilkrn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eW1pYXR1bmN4aHN0a2lsa3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0MzU3NCwiZXhwIjoyMDc5NzE5NTc0fQ.d8JK4CDgoighvaq-Z2RGrWdLG6CwyxUPnylM1UDbkKE
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eW1pYXR1bmN4aHN0a2lsa3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDM1NzQsImV4cCI6MjA3OTcxOTU3NH0.U1d25zHg_R92KtUrWstrrKZVO6NP4vhVWZ2ojbR6K8o
```

## Processo de Scraping

### 1. Contorno do Cloudflare

O processo utiliza a API do MediaWiki do Tibia Fandom para evitar o bloqueio do Cloudflare:

```typescript
// Requisição para obter conteúdo de página específica
const pageUrl = `https://tibia.fandom.com/api.php?action=parse&page=${encodeURIComponent(term)}&format=json`;
```

### 2. Extração de Dados

A extração de dados é realizada através de expressões regulares e buscas estruturadas nos campos específicos do infobox do Tibia Fandom:

- **Nome do item**: Extraído do título da página
- **Imagem**: Encontrada na estrutura de imagem do infobox
- **Level**: Extraído do campo "levelrequired" no infobox
- **Vocação**: Extraído do campo "vocrequired" no infobox
- **Armadura**: Extraído do campo "armor" no infobox
- **Bônus**: Extraído do campo "attrib" no infobox (pode conter múltiplos bônus)
- **Proteções**: Extraído do campo "resist" no infobox (pode conter múltiplas proteções)
- **Slots**: Extraído do campo "imbueslots" no infobox
- **Peso**: Extraído do campo "weight" no infobox
- **Outros campos**: Outras informações estruturadas no infobox

### 3. Estrutura de Dados

Após a extração, os dados são organizados conforme o tipo `ScrapedItem`:

```typescript
interface ScrapedItem {
  name: string;           // Nome do item
  image: string;          // URL da imagem
  level?: number;         // Nível necessário
  vocation?: string;      // Vocação exigida
  armor?: number;         // Valor de armadura
  bonus?: string;         // Bônus do item (pode conter múltiplos bônus separados por vírgula)
  protection?: string;    // Proteções (pode conter múltiplas proteções separadas por vírgula)
  slots?: number;         // Slots de encantamento
  tier?: string;          // Tier do item
  weight?: number;        // Peso do item
}
```

## Conversão para Banco de Dados

### Formato de Inserção

Após a extração, os dados são convertidos para o formato apropriado para o banco de dados:

```typescript
export function convertToArmorDBFormat(items: ScrapedItem[]): Omit<ArmorDB, 'id'>[] {
  return items.map(item => ({
    name: item.name,      // Fica fora do JSON
    dados: {              // Tudo o resto vai para o campo JSON 'dados'
      imageUrl: item.image,
      level: item.level,
      vocation: item.vocation,
      armor: item.armor,
      bonus: item.bonus,
      protection: item.protection,
      slots: item.slots,
      tier: item.tier,
      weight: item.weight
    },
    ativo: true           // Define se o item está ativo
  }));
}
```

### Estrutura da Tabela

A tabela 'armor' no banco de dados Supabase tem a seguinte estrutura:

```sql
CREATE TABLE armor (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,           -- Nome do item
  dados JSON,                  -- Atributos do item em formato JSON
  ativo BOOLEAN DEFAULT TRUE   -- Status do item
);
```

## Processo de Inserção

### 1. Conexão com o Banco

A conexão utiliza a biblioteca `@supabase/supabase-js` e a chave de serviço:

```typescript
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});
```

### 2. Inserção de Dados

A inserção é feita usando o método `.insert()` da API do Supabase:

```typescript
const { data, error } = await supabase
  .from('armor')
  .insert(armorData)
  .select();
```

### 3. Tratamento de Erros

O sistema inclui tratamento de erros para garantir a integridade dos dados:

```typescript
if (error) {
  console.error('Erro ao inserir dados no banco:', error);
  return false;
}
```

## Scripts de Teste

### Teste de Funcionalidade Completa

O script `test-save-db-format.ts` demonstra o fluxo completo:

1. Executa o scraping
2. Converte os dados para o formato do banco
3. Salva em formato JSON compatível
4. Confirma a estrutura dos dados

### Teste de Inserção no Banco

O script `backend/test-insert.ts` testa a conexão e a inserção:

1. Estabelece conexão com o banco
2. Carrega dados de arquivo JSON
3. Insere no banco de dados
4. Confirma o sucesso da operação

## Boas Práticas

### 1. Segurança

- Chave de serviço (service role) mantida apenas no backend
- Chave anônima (anon) usada apenas no frontend
- Variáveis de ambiente protegidas

### 2. Eficiência

- Scraping em lotes de 5 itens por vez para otimização
- Extração apenas dos dados necessários
- Processamento em etapas para monitoramento
- Atualização contínua do mesmo arquivo para persistência dos dados

### 3. Manutenção

- Código modular e bem documentado
- Separação clara de responsabilidades
- Estrutura de tipo bem definida

## Limitações Conhecidas

1. **Extração de Imagens**: A extração de imagens depende da estrutura do infobox no Tibia Fandom
2. **Atualizações da Fonte**: Mudanças na estrutura da wiki podem afetar a extração
3. **Taxa de Requisições**: A API do MediaWiki pode ter limites de requisições

## Melhorias Futuras

1. **Cache de Dados**: Implementar cache para evitar scraping desnecessário
2. **Verificação de Duplicados**: Sistema para evitar inserção de dados duplicados
3. **Processamento em Lote**: Escalar para processar grandes volumes de dados
4. **Monitoramento**: Adicionar métricas e logging detalhado

## Conclusão

Este processo fornece uma solução robusta e eficiente para extrair dados estruturados do Tibia Fandom e inseri-los no banco de dados Supabase, contornando as proteções de segurança e mantendo a integridade dos dados. A abordagem de extração direta dos campos estruturados do infobox permite capturar informações completas como múltiplos bônus e proteções, níveis, vocações, slots e pesos de forma precisa e confiável.