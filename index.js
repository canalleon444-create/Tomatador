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
const { Client, GatewayIntentBits, SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const GIFEncoder = require("gif-encoder-2");

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
// Use "<:nome:ID>" para emojis customizados
const reactionsMap = {
  "782961153012793375": "🍅", // emoji normal
  "948716563723325540": "<:smili:1369088199619772548>", // emoji customizado
  "719024507293139014": "🍌",
  // Adicione mais usuários se quiser:
  // "ID_DO_USUARIO": "EMOJI"
};

client.once("ready", async () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);

  // Registrar comando /tomate
  const data = [
    new SlashCommandBuilder()
      .setName("tomate")
      .setDescription("Joga um tomate na cabeça do usuário")
      .addUserOption(option =>
        option.setName("alvo")
          .setDescription("Quem vai levar a tomatada")
          .setRequired(true)
      )
      .toJSON()
  ];
  await client.application.commands.set(data);
  console.log("✅ Comando /tomate registrado");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const emoji = reactionsMap[message.author.id];
  if (!emoji) return;

  try {
    await message.react(emoji);
    console.log(`✅ Reagi com ${emoji} à mensagem de ${message.author.tag}`);
  } catch (err) {
    console.error("❌ Erro ao reagir:", err);
  }
});

// --- Comando /tomate ---
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "tomate") return;

  const user = interaction.options.getUser("alvo");
  const avatarURL = user.displayAvatarURL({ extension: "png", size: 256 });

  await interaction.deferReply();

  try {
    const avatar = await loadImage(avatarURL);
    const tomato = await loadImage("https://i.imgur.com/9l7V9EY.png"); // PNG transparente de tomate

    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext("2d");

    const encoder = new GIFEncoder(256, 256);
    encoder.setDelay(100);
    encoder.start();

    // Frames do GIF (tomate descendo)
    for (let y = -100; y < 180; y += 20) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(avatar, 0, 0, 256, 256);
      ctx.drawImage(tomato, 80, y, 100, 100);
      encoder.addFrame(ctx);
    }

    encoder.finish();
    const buffer = encoder.out.getData();

    await interaction.editReply({
      content: `🍅 ${user.username} levou uma tomatada!`,
      files: [{ attachment: buffer, name: "tomatada.gif" }]
    });

  } catch (err) {
    console.error("❌ Erro ao gerar gif:", err);
    await interaction.editReply("⚠️ Não consegui gerar o gif...");
  }
});

if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
