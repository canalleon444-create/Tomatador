require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express'); // Servidor fake para Render

// Variáveis de ambiente
const TOKEN = process.env.TOKEN;
const USER_ID = process.env.USER_ID;
const EMOJI = process.env.EMOJI || '😎';

if (!TOKEN || !USER_ID) {
  console.error('⚠️ Faltando TOKEN ou USER_ID no .env');
  process.exit(1);
}

// === BOT DISCORD ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.author.id === USER_ID) {
    try {
      await message.react(EMOJI);
      console.log(`Reagi ${EMOJI} em mensagem de ${message.author.tag}`);
    } catch (err) {
      console.error('Erro ao reagir:', err);
    }
  }
});

client.login(TOKEN);

// === SERVIDOR FAKE PARA RENDER ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot online e rodando no Render!'));

app.listen(PORT, () => {
  console.log(`Servidor fake rodando na porta ${PORT}`);
});
  
