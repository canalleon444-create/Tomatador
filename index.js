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
const Canvas = require("@napi-rs/canvas");
const fetch = require("node-fetch");

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

// Map de usuários e seus respectivos emojis
const reactionsMap = {
  "782961153012793375": "🍅",
  "948716563723325540": "<:smili:1369088199619772548>",
  "719024507293139014": "🍌",
};

client.once("ready", () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
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

if (!TOKEN) {
  console.error("⚠️ Faltando TOKEN no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);

// --- COMANDO /TOMATE ESTÁTICO ---
const commands = [
  new SlashCommandBuilder()
    .setName("tomate")
    .setDescription("Joga um tomate na cabeça de alguém")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("O usuário que vai levar o tomate")
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🛠️ Registrando comando de slash...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comando registrado com sucesso!");
  } catch (err) {
    console.error(err);
  }
})();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "tomate") {
    const user = interaction.options.getUser("usuario");
    if (!user) return;

    try {
      // Baixa avatar do usuário
      const avatarURL = user.displayAvatarURL({ format: "png", size: 512 });
      const avatarBuffer = await fetch(avatarURL).then(res => res.buffer());
      const avatar = await Canvas.loadImage(avatarBuffer);

      // Baixa PNG do tomate
      const tomatoURL = "URL_DO_SEU_PNG_DO_TOMATE"; // substitua pelo PNG do tomate
      const tomatoBuffer = await fetch(tomatoURL).then(res => res.buffer());
      const tomato = await Canvas.loadImage(tomatoBuffer);

      // Cria canvas e sobrepõe
      const canvas = Canvas.createCanvas(512, 512);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(avatar, 0, 0, 512, 512);
      ctx.drawImage(tomato, 0, 0, 512, 512);

      const buffer = canvas.toBuffer("image/png");

      await interaction.reply({
        content: `${user} levou uma tomatada! 🍅`,
        files: [{ attachment: buffer, name: "tomate.png" }]
      });

    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Não consegui gerar a imagem 😢");
    }
  }
});
