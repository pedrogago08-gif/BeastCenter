# BeastCenter - Website Completo de Ginásio

## Visão Geral
Website completo para gestão de ginásio com área pública, área de cliente e painel administrativo.

---

## Estrutura do Projeto

```
PAP/
+-- Pages/
¦   +-- Index.html              # Página principal
¦   +-- planos.html             # Planos de subscrição
¦   +-- trainers.html           # Personal Trainers
¦   +-- aulas.html              # Horário de aulas
¦   +-- videos.html             # Biblioteca de vídeos
¦   +-- login.html              # Login e registo
¦   ¦
¦   +-- loja/
¦   ¦   +-- produtos.html       # Loja de produtos
¦   ¦   +-- carrinho.html       # Carrinho de compras
¦   ¦
¦   +-- cliente/
¦   ¦   +-- dashboard.html      # Dashboard do cliente
¦   ¦
¦   +-- admin/
¦       +-- dashboard.html      # Dashboard administrativo
¦       +-- usuarios.html       # Gestão de utilizadores
¦
+-- Style/
¦   +-- index.css              # CSS da página inicial
¦   +-- pages.css              # CSS geral das páginas
¦   +-- auth.css               # CSS de autenticação
¦   +-- loja.css               # CSS da loja
¦   +-- cliente.css            # CSS da área de cliente
¦   +-- admin.css              # CSS do painel admin
¦
+-- Script/
    +-- main.js                # JavaScript principal
    +-- auth.js                # Autenticação
    +-- loja.js                # Funcionalidades da loja
    +-- (outros scripts...)
```

---

## Funcionalidades Implementadas

### Páginas Públicas
? **Home** - Página principal com slogan e destaques
? **Planos** - Apresentação dos planos Básico, Extra e Premium
? **Personal Trainers** - Lista de treinadores com perfis
? **Aulas** - Horário semanal de aulas de grupo
? **Vídeos** - Biblioteca de vídeos (gratuitos e premium)
? **Login/Registo** - Autenticação de utilizadores

### Loja
? Página de produtos com filtros por categoria
? Produtos organizados em: Merch, Suplementos, Snacks
? Carrinho de compras funcional
? Sistema de cupões de desconto
? Cálculo automático de portes

### Área de Cliente
? Dashboard personalizado
? Estatísticas de treinos
? Próximas aulas marcadas
? Progresso semanal
? Histórico de treinos
? Informações do plano
? Recomendações personalizadas
? Acesso a Personal Trainer atribuído

### Painel de Administrador
? Dashboard com estatísticas gerais
? Gestão completa de utilizadores
? Tabela com todos os membros
? Filtros e pesquisa
? Ações rápidas (adicionar utilizador, criar aula, etc.)
? Alertas e pendências
? Gráficos de novos membros
? Distribuição de planos
? Top Personal Trainers
? Horários de pico
? Atividade recente

---

## Paleta de Cores

- **Primary:** #FF6B35 (Laranja)
- **Secondary:** #004E89 (Azul)
- **Dark Background:** #1A1A2E
- **Light Background:** #F5F5F5
- **Text Dark:** #2D2D2D
- **Success:** #4CAF50
- **Warning:** #FFC107
- **Error:** #F44336

---

## Funcionalidades JavaScript

### main.js
- Navegação suave
- Animações ao scroll
- Navbar sticky
- Toast notifications
- LocalStorage helper functions

### auth.js
- Login de utilizadores
- Registo de novos membros
- Validação de formulários
- Verificação de força da password
- Integração com redes sociais (preparado)

### loja.js
- Gestão do carrinho
- Adicionar/remover produtos
- Atualizar quantidades
- Aplicar cupões de desconto
- Cálculo de portes
- Filtros de produtos
- Ordenação


---

## Responsividade

Todos os estilos CSS incluem media queries para dispositivos móveis:
- Tablets (< 1024px)
- Smartphones (< 768px)
- Pequenos ecrãs (< 600px)

---

## Como Abrir e Correr o Site

### Opção 1: Abrir Diretamente no Navegador (Simples)

1. **Navega até à pasta do projeto:**
   ```
   C:\Users\pedro\OneDrive\Ambiente de Trabalho\PAP\
   ```

2. **Abre a página principal:**
   - Clica duas vezes no ficheiro `Pages/Index.html`
   - OU clica com o botão direito ? "Abrir com" ? Chrome/Firefox/Edge

3. **Pronto!** O site abre no navegador e já podes navegar.

### Opção 2: Com Servidor Local (Recomendado)

Para evitar problemas com ficheiros locais e ter uma experiência mais realista, usa um servidor local:

#### A) Usando Python (se tiveres instalado):

1. **Abre o terminal/PowerShell na pasta do projeto:**
   ```bash
   cd "C:\Users\pedro\OneDrive\Ambiente de Trabalho\PAP"
   ```

2. **Python 3.x - Inicia o servidor:**
   ```bash
   python -m http.server 8000
   ```

   **OU Python 2.x:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

3. **Abre o navegador e vai para:**
   ```
   http://localhost:8000/Pages/Index.html
   ```

#### B) Usando Node.js (se tiveres instalado):

1. **Instala o http-server globalmente (só precisas fazer uma vez):**
   ```bash
   npm install -g http-server
   ```

2. **Abre o terminal na pasta do projeto:**
   ```bash
   cd "C:\Users\pedro\OneDrive\Ambiente de Trabalho\PAP"
   ```

3. **Inicia o servidor:**
   ```bash
   http-server -p 8000
   ```

4. **Abre o navegador e vai para:**
   ```
   http://localhost:8000/Pages/Index.html
   ```

#### C) Usando Live Server (VS Code):

1. **Instala a extensão "Live Server" no VS Code**

2. **Abre a pasta do projeto no VS Code**

3. **Clica com o botão direito em `Pages/Index.html`**

4. **Seleciona "Open with Live Server"**

5. **O site abre automaticamente no navegador!**

### Como Testar o Site

1. **Página Principal:**
   - Abre `http://localhost:8000/Pages/Index.html`
   - Navega pelos diferentes menus

2. **Testar Login:**
   - Vai para a página de login
   - Cria uma conta nova (dados guardados no localStorage)
   - Faz login com a conta criada

3. **Explorar Área de Cliente:**
   - Após login, és redirecionado para o dashboard
   - Navega pelas diferentes secções no menu lateral

4. **Testar Loja:**
   - Vai para a loja
   - Adiciona produtos ao carrinho
   - Vai para o carrinho e testa os cupões:
     - `BEAST10` - 10% desconto
     - `BEAST20` - 20% desconto
     - `WELCOME` - 15% desconto


6. **Painel Admin:**
   - Abre `http://localhost:8000/Pages/admin/dashboard.html`
   - Explora a gestão de utilizadores
   - (Em produção, requer autenticação de administrador)

### Nota Importante

Se abrires diretamente no navegador (sem servidor), alguns ficheiros JavaScript podem ter problemas com **CORS** (Cross-Origin Resource Sharing). Por isso, é **recomendado usar um servidor local** para testar todas as funcionalidades.

---

## Comentários no Código

Todos os ficheiros HTML incluem comentários explicativos em português:
- Estrutura das secções
- Funcionalidade dos elementos
- Propósito de cada componente
- Links e navegação

---

## Melhorias Futuras (Sugestões)

## Backend e MongoDB

O projeto deixou de estar limitado a `localStorage` e passou a ter uma base de backend preparada em:

```text
backend/
  src/
    app.js
    server.js
    config/
    models/
    routes/
    services/
    utils/
```

### O que já existe

- API Express base
- Ligação MongoDB com Mongoose
- Modelo `User`
- Rotas:
  - `GET /api/health`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/admin-login`
  - `GET /api/users`
  - `POST /api/users`
  - `PATCH /api/users/:id`
- Criação automática do admin inicial no arranque:
  - utilizador: `beastadmin`
  - password: `admin123`

### O que tens de instalar na tua máquina

1. Node.js LTS
   Link: https://nodejs.org/

2. MongoDB
   Podes escolher uma destas opções:
   - MongoDB Community Server local
   - MongoDB Atlas (cloud)

### Passos recomendados

1. Instala o Node.js.
2. Instala o MongoDB ou cria um cluster Atlas.
3. Na raiz do projeto, executa:

```bash
npm install
```

4. Se fores usar MongoDB local, confirma que o serviço está ativo.
5. Se fores usar Atlas, substitui o `MONGODB_URI` no ficheiro `.env`.
6. Arranca a API:

```bash
npm run dev
```

7. Testa no navegador:

```text
http://localhost:3000/api/health
```

Se aparecer resposta JSON, a API está online.

### Configuração atual do `.env`

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/beastcenter
CLIENT_ORIGIN=*
```

### Nota importante

Neste ambiente atual do Codex, `npm` e `mongod` não estão disponíveis no PATH, por isso a instalação e o arranque local tens mesmo de os fazer tu na tua máquina. O código já ficou preparado para funcionar assim que isso estiver instalado.

- [ ] Integração com backend (API)
- [ ] Base de dados real
- [ ] Sistema de pagamentos real
- [ ] Upload de imagens
- [ ] Chat ao vivo
- [ ] Notificações push
- [ ] App mobile
- [ ] Sistema de reservas em tempo real

---

## Estrutura de Navegação

### Menu Principal (Público)
- Home
- Planos
- Personal Trainers
- Aulas
- Loja
- Vídeos
- Sobre Nós
- Login

### Menu Cliente (Área Privada)
- Dashboard
- Histórico de Treinos
- Aulas Marcadas
- Progresso
- Personal Trainers
- Recompensas
- Plano Alimentar
- Loja
- Definições

### Menu Admin
- Dashboard
- Estatísticas
- Gerir Utilizadores
- Gerir Personal Trainers
- Gerir Aulas
- Gerir Loja
- Gerir Vídeos
- Gerir Planos
- Mensagens
- Sistema de Recompensas
- Notificações

---

## Tecnologias Utilizadas

- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização e animações
- **Google Fonts** - Bebas Neue, Space Grotesk
- **JavaScript (Vanilla)** - Interatividade
- **LocalStorage** - Armazenamento local de dados
- **Chart.js** - Gráficos (admin dashboard)
- **Font Awesome / Emojis** - Ícones

---

## Status do Projeto

**PROJETO COMPLETO** ?

Todas as páginas principais foram criadas com:
- HTML estruturado e comentado
- CSS responsivo e moderno
- JavaScript funcional
- Navegação completa
- Design consistente
- Comentários explicativos

---

## Notas Importantes

1. **Imagens**: Os caminhos das imagens estão definidos mas as imagens precisam de ser adicionadas às pastas:
   - `/images/logo.png`
   - `/images/trainers/`
   - `/images/products/`
   - `/images/users/`

2. **LocalStorage**: Os dados são guardados localmente no navegador. Para produção, implementar backend.

3. **Autenticação**: Sistema de login é simulado. Para produção, implementar autenticação real com backend.

4. **Gráficos**: O admin dashboard usa Chart.js. Incluir a biblioteca:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
   ```

---

**Desenvolvido para BeastCenter © 2025**




