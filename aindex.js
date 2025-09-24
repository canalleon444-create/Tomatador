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
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// Map de usuários e seus respectivos emojis (para reações automáticas)
const reactionsMap = {
  "782961153012793375": "🍅", // emoji normal
  "948716563723325540": "<:smili:1369088199619772548>", // emoji customizado
  "719024507293139014": "🍌",
};

client.once("ready", async () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);

  // --- Registro do slash command /tomate ---
  const commands = [
    new SlashCommandBuilder()
      .setName("tomate")
      .setDescription("Leva uma tomatada!")
      .toJSON()
  ];

  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    console.log("🚀 Registrando comando /tomate...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comando registrado com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao registrar comando:", err);
  }
});

// --- Evento de slash command ---
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "tomate") {
    try {
      // Caminho do GIF local
      const gifPath = path.join(__dirname, "assets", "F5bOIyA.gif");
      const attachment = new AttachmentBuilder(gifPath);

      await interaction.reply({ content: `${interaction.user} levou uma tomatada! 💀`, files: [attachment] });
    } catch (err) {
      console.error("❌ Erro ao enviar GIF do tomate:", err);
      await interaction.reply("❌ Erro ao gerar o GIF do tomate.");
    }
  }
});

// --- Evento de mensagens para reações ---
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

// --- Login do bot ---
if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
