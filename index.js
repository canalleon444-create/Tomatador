// 1️⃣ Carregar variáveis de ambiente
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

// 2️⃣ Pegar variáveis do .env
const TOKEN = process.env.TOKEN;
const USER_ID = process.env.USER_ID;
const EMOJI = process.env.EMOJI || '😎';

if (!TOKEN || !USER_ID) {
  console.error('⚠️ Faltando TOKEN ou USER_ID no .env');
  process.exit(1);
}

// 3️⃣ Criar cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 4️⃣ Evento: bot ficou online
client.once('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
});

// 5️⃣ Evento: quando uma mensagem é criada
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;          // Ignora bots
  if (message.author.id === USER_ID) {     // Verifica usuário específico
    try {
      await message.react(EMOJI);          // Reage com o emoji
      console.log(`Reagi ${EMOJI} em mensagem de ${message.author.tag}`);
    } catch (err) {
      console.error('Erro ao reagir:', err);
    }
  }
});

// 6️⃣ Logar o bot usando o token
client.login(TOKEN);
