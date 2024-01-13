const { Client, GatewayIntentBits, Partials } = require("discord.js");
const config = require("./config");

let discord = {
  user: {},
  status: "",
  clientStatus: {},
  activities: [],
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.User, Partials.GuildMember],
});

client.login(config.bot.token);

module.exports = async (db, cb) => {
  client.on("ready", async () => {
    let user = await client.users.fetch(config.user.id);

    delete user.bot;
    delete user.system;

    updateData({ type: "user", data: user });
  });

  client.on("userUpdate", async (_, user) => {
    if (user?.id !== config.user.id) return;

    delete user.bot;
    delete user.system;

    await updateData({ type: "user", data: user });
  });

  client.on("presenceUpdate", async (_, presence) => {
    if (presence?.userId !== config.user.id) return;

    const { status, clientStatus, activities } = presence;

    await updateData({
      type: "presence",
      data: { status, clientStatus, activities },
    });
  });

  const updateData = async ({ type, data }) => {
    switch (type) {
      case "user":
        {
          discord.user = data;
        }
        break;

      case "presence":
        {
          Object.keys(data).forEach(async (key) => {
            discord[key] = data[key];
          });
        }
        break;
    }

    await cb(discord);

    db.set("data", discord);
  };
};
