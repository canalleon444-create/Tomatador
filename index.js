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
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
});

// --- Map de usuários e seus respectivos emojis ---
const reactionsMap = {
  "782961153012793375": "🍅", // emoji normal
  "948716563723325540": "<:smili:1369088199619772548>", // emoji customizado
  "719024507293139014": "🍌",
  // Adicione mais usuários se quiser
};

// --- Registrar slash command ---
const commands = [
  new SlashCommandBuilder()
    .setName("tomate")
    .setDescription("Atira um tomate em alguém!")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("Registrando comandos...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log("Comandos registrados!");
  } catch (err) {
    console.error(err);
  }
})();

// --- Eventos ---
client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

// Reações automáticas por usuário
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

// Slash command /tomate
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "tomate") {
    await interaction.reply({
      content: "💀 Tomatada!",
      files: ["https://i.imgur.com/F5bOIyA.gif"]
    });
  }
});

// --- Login ---
if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("⚠️ Faltando variáveis de ambiente no .env");
  process.exit(1);
}

client.login(TOKEN);
