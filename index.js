// --- Bot Discord ---
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
});

const TOKEN = process.env.TOKEN;

// Mapa de usuários e emojis
const reactionsMap = {
  "782961153012793375": "🍅",                    // emoji normal
  "606183739084636198": "<:smili:1419829654273130506>" // emoji customizado
};

client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const emoji = reactionsMap[message.author.id];
  if (!emoji) return;

  try {
    // Para emojis customizados, Discord.js precisa do formato <:nome:id>
    await message.react(emoji);
    console.log(`Reagi com ${emoji} à mensagem de ${message.author.tag}`);
  } catch (err) {
    console.error("Erro ao reagir:", err);
  }
});

if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
