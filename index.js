const client = new discord.Client({
    intents: Object.values(discord.GatewayIntentBits),
    Partials: [
        discord.Partials.message,
        discord.Partials.channel,
        discord.Partials.Reaction
    ],
});
