require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const TOKEN = process.env.TOKEN;
const USER_ID = process.env.USER_ID;
const EMOJI = process.env.EMOJI || '😎';

if (!TOKEN || !USER_ID) {
  console.error('⚠️ Faltando TOKEN ou USER_ID. Verifique suas variáveis de ambiente.');
  process.exit(1);
}

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
