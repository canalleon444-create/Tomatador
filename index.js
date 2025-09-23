// --- Servidor fake para Render ---
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot está rodando!");
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor fake rodando na porta ${PORT}`);
});

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

// Defina aqui os usuários e emojis
// Para emoji customizado use "nome:id"
const reactionsMap = {
  "719024507293139014": "🍅",                     // emoji normal
  "606183739084636198": "smili:1419829654273130506" // emoji customizado
};

client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const emoji = reactionsMap[message.author.id];
  if (!emoji) return;

  try {
    if (emoji.includes(":")) {
      // Emoji customizado
      const emojiId = emoji.split(":")[1];
      const customEmoji = client.emojis.cache.get(emojiId);
      if (customEmoji) {
        await message.react(customEmoji);
        console.log(`Reagi com ${customEmoji.name} à mensagem de ${message.author.tag}`);
      } else {
        console.log(`Emoji customizado ${emoji} não encontrado no cache do bot.`);
      }
    } else {
      // Emoji normal
      await message.react(emoji);
      console.log(`Reagi com ${emoji} à mensagem de ${message.author.tag}`);
    }
  } catch (err) {
    console.error("Erro ao reagir:", err);
  }
});

if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
