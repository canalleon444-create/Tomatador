// index.cjs
const { Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const EMOJI = process.env.EMOJI || "🍅";

// Registro do comando /tomate
const commands = [
  {
    name: 'tomate',
    description: 'Leva uma tomatada!'
  }
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🚀 Registrando comando /tomate...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Comando registrado com sucesso!');
  } catch (err) {
    console.error(err);
  }
})();

// Evento quando o bot estiver pronto
client.on('clientReady', () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

// Evento para interações
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'tomate') {
    try {
      // Defer para evitar erro 10062
      await interaction.deferReply();

      // Caminho do GIF local
      const gifPath = path.join(__dirname, 'assets', 'F5bOIyA.gif');

      if (!fs.existsSync(gifPath)) {
        return interaction.editReply('❌ GIF do tomate não encontrado.');
      }

      await interaction.editReply({
        content: `${EMOJI} nofirepqp levou uma tomatada!`,
        files: [gifPath]
      });
    } catch (err) {
      console.error('❌ Erro ao enviar GIF do tomate:', err);
      if (interaction.deferred || interaction.replied) {
        interaction.editReply('❌ Erro ao enviar o GIF do tomate.');
      } else {
        interaction.reply('❌ Erro ao enviar o GIF do tomate.');
      }
    }
  }
});

client.login(TOKEN);
