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
const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST, AttachmentBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // ID do bot
const GUILD_ID = process.env.GUILD_ID;   // ID do servidor

// Map de usuários e seus respectivos emojis
const reactionsMap = {
  "782961153012793375": "🍅",
  "948716563723325540": "<:smili:1369088199619772548>",
  "719024507293139014": "🍌"
};

// --- Registrar comando /tomate ---
const commands = [
  new SlashCommandBuilder()
    .setName("tomate")
    .setDescription("Coloca um tomate sobre o avatar de alguém")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuário que vai receber o tomate")
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🌐 Registrando comandos de barra...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Comandos registrados!");
  } catch (err) {
    console.error(err);
  }
})();

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

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "tomate") {
    const user = interaction.options.getUser("usuario");

    if (!user) {
      return interaction.reply({ content: "Usuário não encontrado!", ephemeral: true });
    }

    // URL do GIF do tomate (troque por qualquer GIF que quiser)
    const gifUrl = "https://tenor.com/pt-BR/view/throw-tomato-gif-3542171367496133370";

    // Avatar da pessoa
    const avatarUrl = user.displayAvatarURL({ format: "png", size: 512 });

    // Aqui você pode usar alguma API de manipulação de imagem, ou simplesmente mandar o GIF + avatar em embed
    const embed = {
      title: `🍅 Tomate pra você, ${user.username}!`,
      image: { url: gifUrl },
      description: `[Avatar de ${user.username}](${avatarUrl})`
    };

    await interaction.reply({ embeds: [embed] });
  }
});

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("⚠️ Faltando variáveis no .env: TOKEN, CLIENT_ID ou GUILD_ID");
  process.exit(1);
}

client.login(TOKEN);
