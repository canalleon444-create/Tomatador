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

// Defina os usuários e emojis aqui
// Para emojis customizados use apenas o ID do emoji, e o bot precisa ter acesso a ele
const reactionsMap = {
  "782961153012793375": ["🍅"],
  "606183739084636198": ["1419829654273130506"], // primeiro emoji custom, segundo normal
  "719024507293139014": ["🍌""] // exemplo de outro usuário
};

client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const emojis = reactionsMap[message.author.id];
  if (!emojis) return;

  for (const emoji of emojis) {
    try {
      await message.react(emoji); // funciona com Unicode ou ID de emoji custom
      console.log(`Reagi com ${emoji} à mensagem de ${message.author.tag}`);
    } catch (err) {
      console.error("Erro ao reagir:", err);
    }
  }
});

if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
