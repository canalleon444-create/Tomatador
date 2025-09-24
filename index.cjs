// index.cjs

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
const { Client, GatewayIntentBits, Partials, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const EMOJI = process.env.EMOJI || "🍅";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel],
});

// Map de usuários e seus respectivos emojis (mensagens gerais)
const reactionsMap = {
  "782961153012793375": "🍅",
  "948716563723325540": "<:smili:1369088199619772548>",
  "719024507293139014": "🍌",
};

// Registro do comando /tomate
const commands = [
  { name: "tomate", description: "Leva uma tomatada!" },
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🚀 Registrando comando /tomate...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log("✅ Comando registrado com sucesso!");
  } catch (err) {
    console.error(err);
  }
})();

// Evento quando o bot estiver pronto
client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

// Evento para reagir a mensagens normais
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

// Evento para interações (comando /tomate)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "tomate") {
    try {
      await interaction.deferReply();

      const gifPath = path.join(__dirname, "assets", "F5bOIyA.gif");
      if (!fs.existsSync(gifPath)) {
        return interaction.editReply("❌ GIF do tomate não encontrado.");
      }

      await interaction.editReply({
        content: `${EMOJI} nofirepqp levou uma tomatada!`,
        files: [gifPath],
      });
    } catch (err) {
      console.error("❌ Erro ao enviar GIF do tomate:", err);
      if (interaction.deferred || interaction.replied) {
        interaction.editReply("❌ Erro ao enviar o GIF do tomate.");
      } else {
        interaction.reply("❌ Erro ao enviar o GIF do tomate.");
      }
    }
  }
});

if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
