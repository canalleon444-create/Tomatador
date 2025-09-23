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

// Defina aqui os usuários e emojis (para emojis customizados use "nome:id")
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
    // Se for emoji customizado
    if (emoji.includes(":")) {
      const [name, id] = emoji.split(":");
      const emojiObj = client.emojis.cache.get(id);
      if (emojiObj) {
        await message.react(emojiObj);
        console.log(`✅ Reagi com emoji customizado ${emojiObj.name} à mensagem de ${message.author.tag}`);
      } else {
        console.log(`❌ Emoji customizado ${name}:${id} não encontrado no cache do bot`);
      }
    } else {
      // Emoji normal
      await message.react(emoji);
      console.log(`✅ Reagi com ${emoji} à mensagem de ${message.author.tag}`);
    }
  } catch (err) {
    console.error("❌ Erro ao reagir:", err);
  }
});

if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
