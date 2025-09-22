require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const TOKEN = process.env.TOKEN;
const USER_ID = process.env.USER_ID; // ID da pessoa que o bot vai reagir
const EMOJI = "🍅"; // pode trocar pelo emoji que quiser

client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // ignora outros bots
  if (message.author.id === USER_ID) {
    try {
      await message.react(EMOJI);
      console.log(`Reagi com ${EMOJI} à mensagem de ${message.author.tag}`);
    } catch (err) {
      console.error("Erro ao reagir:", err);
    }
  }
});

if (!TOKEN || !USER_ID) {
  console.error("⚠️ Faltando TOKEN ou USER_ID no .env / Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
