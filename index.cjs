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
const Canvas = require("canvas");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
});

const TOKEN = process.env.TOKEN;

// Map de usuários e seus respectivos emojis
const reactionsMap = {
  "782961153012793375": "🍅", // emoji normal
  "948716563723325540": "<:smili:1369088199619772548>", // emoji customizado
  "719024507293139014": "🍌",
};

// Função para gerar GIF do tomate sobre avatar
async function generateTomatoGif(avatarUrl) {
  try {
    const tomatoGifUrl = "https://i.imgur.com/F5bOIyA.gif"; // GIF do tomate
    const [avatarResp, tomatoResp] = await Promise.all([
      axios.get(avatarUrl, { responseType: "arraybuffer" }),
      axios.get(tomatoGifUrl, { responseType: "arraybuffer" })
    ]);

    const avatar = await Canvas.loadImage(avatarResp.data);
    const tomato = await Canvas.loadImage(tomatoResp.data);

    const canvas = Canvas.createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(tomato, 0, 0, canvas.width, canvas.height);

    return canvas.toBuffer("image/gif"); // retorna GIF
  } catch (err) {
    console.error("❌ Erro ao gerar o GIF do tomate.", err);
    return null;
  }
}

client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const emoji = reactionsMap[message.author.id];
  if (emoji) {
    try {
      await message.react(emoji);
      console.log(`✅ Reagi com ${emoji} à mensagem de ${message.author.tag}`);
    } catch (err) {
      console.error("❌ Erro ao reagir:", err);
    }
  }

  if (message.content.startsWith("!tomate")) {
    const mention = message.mentions.users.first();
    if (!mention) return message.reply("⚠️ Você precisa mencionar alguém!");

    const avatarUrl = mention.displayAvatarURL({ extension: "png", size: 512 });

    const gifBuffer = await generateTomatoGif(avatarUrl);
    if (!gifBuffer) return message.reply("❌ Erro ao gerar o GIF do tomate.");

    const attachment = new AttachmentBuilder(gifBuffer, { name: "tomate.gif" });

    message.channel.send({
      content: `💀 ${mention.username} levou uma tomatada!`,
      files: [attachment]
    });
  }
});

if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
