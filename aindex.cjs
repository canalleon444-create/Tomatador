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
const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const GIFEncoder = require("gifencoder");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const TOKEN = process.env.TOKEN;

// Map de usuários e seus respectivos emojis
const reactionsMap = {
  "782961153012793375": "🍅",
  "948716563723325540": "<:smili:1369088199619772548>",
  "719024507293139014": "🍌",
  // Adicione mais usuários se quiser
};

client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // --- Reação de emoji ---
  const emoji = reactionsMap[message.author.id];
  if (emoji) {
    try {
      await message.react(emoji);
      console.log(`✅ Reagi com ${emoji} à mensagem de ${message.author.tag}`);
    } catch (err) {
      console.error("❌ Erro ao reagir:", err);
    }
  }

  // --- GIF do tomate sobre avatar ---
  if (message.mentions.users.size > 0) {
    const user = message.mentions.users.first();
    try {
      const avatarURL = user.displayAvatarURL({ extension: "png", size: 128 });
      const avatar = await loadImage(avatarURL);

      // Pega o GIF do tomate
      const tomatoURL = "https://i.imgur.com/F5bOIyA.gif";
      const response = await axios.get(tomatoURL, { responseType: "arraybuffer" });
      const tomatoBuffer = Buffer.from(response.data);
      const tomato = await loadImage(tomatoBuffer);

      // Configura GIFEncoder
      const encoder = new GIFEncoder(128, 128);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(100);
      encoder.setQuality(10);

      const canvas = createCanvas(128, 128);
      const ctx = canvas.getContext("2d");

      // Simula 10 frames do GIF (para simplificação)
      for (let i = 0; i < 10; i++) {
        ctx.clearRect(0, 0, 128, 128);
        ctx.drawImage(avatar, 0, 0, 128, 128);
        ctx.drawImage(tomato, 0, 0, 128, 128);
        encoder.addFrame(ctx);
      }

      encoder.finish();
      const buffer = encoder.out.getData();
      const attachment = new AttachmentBuilder(buffer, { name: "tomato.gif" });

      await message.reply({ content: `💀 ${user.tag} levou uma tomatada!`, files: [attachment] });
    } catch (err) {
      console.error("❌ Erro ao gerar GIF do tomate:", err);
      await message.reply("❌ Erro ao gerar o GIF do tomate.");
    }
  }
});

if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
