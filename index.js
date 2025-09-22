const { Client, GatewayIntentBits, Partials } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const reactionRoles = {
  "🍎": "782961153012793375", // cargo ID 1
  "🍌": "719024507293139014", // cargo ID 2
  ":smili:": "948716563723325540"  // cargo ID 3
};

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.message.id === "ID_DA_MENSAGEM") {
    const roleId = reactionRoles[reaction.emoji.name];
    if (!roleId) return;

    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);
    if (member) {
      await member.roles.add(roleId);
      console.log(`Adicionei o cargo ${roleId} para ${user.tag}`);
    }
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.message.id === "ID_DA_MENSAGEM") {
    const roleId = reactionRoles[reaction.emoji.name];
    if (!roleId) return;

    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);
    if (member) {
      await member.roles.remove(roleId);
      console.log(`Removi o cargo ${roleId} de ${user.tag}`);
    }
  }
});

client.login(process.env.TOKEN);
