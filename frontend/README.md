# Frontend - Turma AEB

Modulo frontend do SAGI (Sistema de Assistentes Virtuais Inteligentes) do Programa AEB Escola.

Aplicacao React com Vite que fornece a interface de chat com os personagens virtuais da Turma AEB.

## Inicio Rapido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desenvolvimento (porta 3000)
npm run dev

# Build de producao
npm run build

# Lint
npm run lint
```

## Configuracao

As variaveis de ambiente estao no arquivo `.env`:

| Variavel | Descricao | Padrao |
|----------|-----------|--------|
| `VITE_API_URL` | URL do backend FastAPI | `http://localhost:8002` |

## Dependencias Principais

- **React** 19.2 - Biblioteca de UI
- **Vite** 8.0 - Bundler e dev server com HMR
- **ESLint** 9 - Linting com plugins para React Hooks e React Refresh

## Estrutura

```
src/
  App.jsx       # Componente principal (selecao de personagem + chat)
  App.css       # Estilos do componente
  main.jsx      # Ponto de entrada
  index.css     # Estilos globais
  assets/       # Imagens dos personagens e logos
```

Para documentacao completa do projeto, veja o [README principal](../README.md).
