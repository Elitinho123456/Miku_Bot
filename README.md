# Miku Discord Bot 

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18.x+-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.x-blue.svg)](https://discord.js.org/)

Um bot inteligente para Discord que utiliza a API do Google Gemini para fornecer respostas naturais e interativas. O Miku Bot pode ser usado tanto em servidores quanto em mensagens diretas (DMs).

## ✨ Recursos

- 💬 Chat interativo com IA
- 🧠 Memória de conversa por usuário/canal
- 🤖 Suporte a múltiplos modelos do Gemini (Lite, Flash, Pro)
- 🔄 Troca de modelos em tempo real
- 🧹 Limpeza de histórico de conversa
- 💬 Suporte a mensagens diretas (DMs)
- 🎨 Geração de imagens em breve (não tenho certeza de como fazer funcionar, a google tá me boicotando só porque uso a api free)
- ✏️ Edição de imagens com IA em breve (não tenho certeza de como fazer funcionar, a google tá me boicotando só porque uso a api free)

## 🚀 Instalação

1. **Pré-requisitos**
   - Node.js 18.x ou superior
   - Conta no Google Cloud com a API do Gemini ativada
   - Bot do Discord criado no [Portal de Desenvolvedores do Discord](https://discord.com/developers/applications)

2. **Configuração**
   ```bash
   # Clone o repositório
   git clone https://github.com/Elitinho123456/API-DICORD-BOT.git
   cd API-DICORD-BOT
   
   # Instale as dependências
   npm i
   ou
   npm run build (instala e atualiza as dependências em caso de um projeto já iniciado)
   
   # Crie um arquivo .env baseado no .env.example
   copy .env.example .env
   ```

3. **Configure as variáveis de ambiente**
   Edite o arquivo `.env` com suas credenciais:
   ```
   DISCORD_TOKEN=seu_token_do_bot
   GOOGLE_API_KEY=sua_chave_da_api_google
   ```

## ⚙️ Comandos

| Comando | Descrição |
|---------|-----------|
| `!miku ajuda` | Mostra esta mensagem de ajuda |
| `!miku modelos` | Lista os modelos disponíveis |
| `!miku modelo [lite/flash/pro]` | Muda o modelo de IA |
| `!miku limpar` | Limpa o histórico de conversa |

## 🤖 Modelos Suportados

- **Lite**: `gemini-2.5-flash-lite` - Rápido e eficiente para respostas curtas
- **Flash**: `gemini-2.5-flash` - Equilíbrio entre velocidade e qualidade
- **Pro**: `gemini-2.5-pro` - Mais avançado, ideal para respostas detalhadas

## 🧠 Memória

O bot mantém o histórico de conversas separado por:
- Canais do servidor
- Mensagens diretas (DMs)
- Usuários individuais

## 🛡️ Segurança

- Configurações de segurança implementadas para filtrar conteúdos inadequados, por padrão tudo é permitido (em tese)
- Histórico de conversas armazenado apenas em memória (não persiste após reinicialização, mas pretendo implementar um sistema de banco de dados para armazenar o histórico de conversas)

## 📦 Estrutura do Projeto

```
.
├── src/
│   ├── Configs/         # Configurações de segurança
│   ├── Memory/          # Gerenciamento de memória
│   └── Models/          # Modelos de IA (texto, imagem, etc.)
├── .env.example         # Exemplo de variáveis de ambiente
├── index.js             # Ponto de entrada do bot
└── package.json         # Dependências e scripts
```

## 🚀 Iniciando o Bot

```bash
# Instale as dependências (se ainda não tiver feito)
npm run build

# Inicie o bot
npm start
```

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e enviar pull requests.
Eu não sou um bom programador, mas estou aprendendo e tentando me aperfeiçoar, se puder ajude a melhorar o projeto.

## 📄 Licença

Este projeto está licenciado sob a licença ISC - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ❤️ por [Elitinho](https://github.com/Elitinho123456)
