# SAGI - Turma AEB

**Sistema de Assistentes Virtuais Inteligentes do Programa AEB Escola**

Interface de chatbot educacional da Agencia Espacial Brasileira (AEB) com tres personagens especializados em diferentes dominios do setor espacial brasileiro. A aplicacao utiliza sintese de voz (TTS) e reconhecimento de fala para criar uma experiencia interativa e acessivel.

---

## Sumario

- [Visao Geral](#visao-geral)
- [Personagens](#personagens)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Instalacao e Configuracao](#instalacao-e-configuracao)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Scripts Disponiveis](#scripts-disponiveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [API Backend](#api-backend)
- [Contribuicao](#contribuicao)
- [Licenca](#licenca)

---

## Visao Geral

O SAGI (Sistema de Assistentes Virtuais Inteligentes) faz parte do **Programa AEB Escola**, uma iniciativa da Agencia Espacial Brasileira voltada a popularizacao da ciencia espacial. A aplicacao oferece uma interface de chat com tres personagens virtuais que respondem perguntas sobre o setor espacial brasileiro, cada um com sua especialidade.

### Principais Caracteristicas

- **Chat interativo** com tres personagens especializados
- **Sintese de voz (TTS)** com vozes em portugues brasileiro
- **Reconhecimento de fala** para entrada por voz (Chrome/Edge)
- **Interface responsiva** com tema espacial e animacoes
- **Sugestoes contextuais** de perguntas por personagem

---

## Personagens

| Personagem | Especialidade | Dominio |
|------------|---------------|---------|
| **Cosminho** | Especialista Espacial | Lancamentos, Satelites (SGDC, CBERS, Amazonia-1), Centro de Lancamento de Alcantara, INPE, Programa Espacial Brasileiro |
| **Luana** | Especialista Juridica | Legislacao espacial, PNAE, Lei do Espaco (Lei n. 9.994/2000), regulamentacoes da AEB |
| **Sagi-Crab** | Orquestrador Central | Coordenacao geral, triagem de perguntas, todos os temas do setor espacial |

Cada personagem possui:
- Imagem e identidade visual propria
- Voz configurada com pitch e velocidade distintos
- Saudacao personalizada
- Sugestoes de perguntas relevantes ao seu dominio
- Prompt de sistema especializado para a IA

---

## Arquitetura

```
+-------------------+          +-------------------+
|                   |   HTTP   |                   |
|   Frontend        |  ------> |   Backend         |
|   (React + Vite)  |  POST    |   (FastAPI)       |
|   Porta 3000      |  /respond|   Porta 8002      |
|                   |  <------ |                   |
+-------------------+   JSON   +-------------------+
        |
        |--- Web Speech API (TTS + STT)
```

- **Frontend**: Aplicacao React servida pelo Vite na porta 3000
- **Backend**: API FastAPI na porta 8002 que processa mensagens e retorna respostas da IA
- **Proxy**: O Vite esta configurado para fazer proxy de `/api` para `http://localhost:8002`

---

## Tecnologias

### Frontend
- **React** 19.2 - Biblioteca de UI
- **Vite** 8.0 - Bundler e servidor de desenvolvimento
- **ESLint** 9 - Linting de codigo
- **Web Speech API** - Sintese de voz e reconhecimento de fala

### Backend (externo)
- **FastAPI** - Framework Python para a API
- **Endpoint**: `POST /respond` - Recebe mensagens e retorna respostas

---

## Instalacao e Configuracao

### Pre-requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- Backend FastAPI rodando na porta 8002 (ver [API Backend](#api-backend))

### Passos

1. **Clone o repositorio**
   ```bash
   git clone https://github.com/upscalingpermeability/sagi.git
   cd sagi/frontend
   ```

2. **Instale as dependencias**
   ```bash
   npm install
   ```

3. **Configure as variaveis de ambiente**
   ```bash
   # O arquivo .env ja vem configurado para desenvolvimento local
   # Edite se necessario:
   cp .env .env.local
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicacao**
   Abra o navegador em [http://localhost:3000](http://localhost:3000)

> **Nota**: O backend FastAPI deve estar rodando na porta 8002 para que o chat funcione. Sem o backend, a interface carrega normalmente mas as mensagens nao serao processadas.

---

## Variaveis de Ambiente

| Variavel | Descricao | Valor Padrao |
|----------|-----------|--------------|
| `VITE_API_URL` | URL base do backend FastAPI | `http://localhost:8002` |

### Arquivos de configuracao

- **`.env`** - Configuracoes de desenvolvimento local
- **`.env.production`** - Configuracoes de producao (ngrok ou URL do servidor)

---

## Scripts Disponiveis

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento na porta 3000 com HMR |
| `npm run build` | Gera a build de producao na pasta `dist/` |
| `npm run preview` | Serve a build de producao localmente para preview |
| `npm run lint` | Executa o ESLint para verificacao de codigo |

---

## Estrutura do Projeto

```
sagi/
  frontend/
    public/
      favicon.svg          # Icone da aplicacao
      icons.svg            # Icones SVG utilizados
    src/
      assets/
        cosminho.png       # Imagem do personagem Cosminho
        luana.png           # Imagem da personagem Luana
        sagi.png            # Imagem do personagem Sagi-Crab
        hero.png            # Imagem hero da pagina
        SGDC2.png           # Imagem do satelite SGDC
        react.svg           # Logo React
        vite.svg            # Logo Vite
      App.jsx              # Componente principal (Turma AEB)
      App.css              # Estilos do componente principal
      main.jsx             # Ponto de entrada da aplicacao
      index.css            # Estilos globais
    .env                   # Variaveis de ambiente (desenvolvimento)
    .env.production        # Variaveis de ambiente (producao)
    eslint.config.js       # Configuracao do ESLint
    index.html             # HTML principal
    package.json           # Dependencias e scripts
    vite.config.js         # Configuracao do Vite
```

---

## Funcionalidades

### 1. Selecao de Personagem
A tela inicial exibe tres cards animados, um para cada personagem. Ao clicar, o usuario entra na tela de chat com o personagem escolhido. E possivel trocar de personagem a qualquer momento pelo menu lateral.

### 2. Chat com IA
O usuario pode enviar mensagens por texto ou voz. As mensagens sao enviadas ao backend FastAPI no formato compativel com a API do WhatsApp Business, permitindo reutilizar a mesma logica de backend para multiplos canais.

**Formato da requisicao:**
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "type": "text",
          "text": { "body": "mensagem do usuario" }
        }],
        "contacts": [{
          "wa_id": "web_user",
          "character": "cosminho"
        }],
        "metadata": {
          "phone_number_id": "web",
          "display_phone_number": "web"
        }
      }
    }]
  }]
}
```

**Formato da resposta:**
```json
{
  "message": "Resposta do assistente"
}
```

### 3. Sintese de Voz (TTS)
Quando ativada, a resposta do personagem e lida em voz alta usando a Web Speech API. Cada personagem possui configuracoes de voz unicas:
- **Cosminho**: Voz masculina, pitch 1.3, velocidade 1.05
- **Luana**: Voz feminina, pitch 1.2, velocidade 0.92
- **Sagi-Crab**: Voz masculina, pitch 0.8, velocidade 0.88

### 4. Reconhecimento de Fala (STT)
O usuario pode clicar no botao de microfone para falar sua pergunta. O reconhecimento de fala usa a Web Speech API (compativel com Chrome e Edge). A mensagem e enviada automaticamente apos o reconhecimento.

### 5. Interface Espacial
- Fundo com gradiente espacial e estrelas animadas
- Cards de personagem com animacoes de hover e entrada
- Sidebar com informacoes do personagem ativo
- Indicadores visuais de estado (falando, ouvindo, aguardando)
- Ondas de voz animadas durante fala/escuta

---

## API Backend

O frontend espera um backend FastAPI rodando no endpoint configurado em `VITE_API_URL` (padrao: `http://localhost:8002`).

### Endpoint principal

```
POST /respond
```

Recebe mensagens no formato da API do WhatsApp Business e retorna a resposta do assistente virtual selecionado.

### Proxy de desenvolvimento

O Vite esta configurado para fazer proxy de requisicoes `/api` para o backend:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8002',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

---

## Contribuicao

1. Faca um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faca commit das mudancas (`git commit -m 'Adiciona nova funcionalidade'`)
4. Envie para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padroes de Codigo

- Use ESLint para verificar o codigo: `npm run lint`
- Siga o estilo de codigo existente (inline styles com objetos JavaScript)
- Componentes React funcionais com hooks
- Nomes de variaveis e funcoes em ingles, conteudo textual em portugues

---

## Licenca

Este projeto faz parte do Programa AEB Escola da Agencia Espacial Brasileira.
