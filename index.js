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

// Mapa de usuários e emojis (use ID de usuário e ID do emoji customizado)
const reactionsMap = {
  "719024507293139014": "🍅", // Emoji padrão
  "606183739084636198": "1419829654273130506" // Somente ID do emoji customizado
};

client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const emojiId = reactionsMap[message.author.id];
  if (!emojiId) return;

  try {
    let emojiToReact;

    // Se emojiId é número, tentamos pegar do cache de emojis do servidor
    if (!isNaN(emojiId)) {
      emojiToReact = message.guild.emojis.cache.get(emojiId);
      if (!emojiToReact) {
        console.warn(`⚠️ Emoji customizado ${emojiId} não encontrado no servidor "${message.guild.name}"`);
        return;
      }
    } else {
      emojiToReact = emojiId; // emoji padrão Unicode
    }

    await message.react(emojiToReact);
    console.log(`✅ Reagi com ${emojiToReact} à mensagem de ${message.author.tag}`);
  } catch (err) {
    console.error("❌ Erro ao reagir:", err);
  }
});

if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
