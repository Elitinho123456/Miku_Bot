const discord = require("discord.js");
const { ActivityType } = require("discord.js")
const config = require("./src/Configs/config")
const { GoogleGenerativeAI } = require("@google/generative-ai");
const safetySetting = require("./src/Configs/safetySettings")
const dotenv = require("dotenv");
dotenv.config();
console.log('Login:', process.env.TEST);

const idCanal = process.env.ID_CANAL;
const idCanal1 = process.env.ID_CANAL1;
const googleAPIKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(googleAPIKey);

// Modelo da  API
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: safetySetting,
});


// Inicia Discord
const client = new discord.Client({
    intents: Object.values(discord.GatewayIntentBits),
    Partials: [
        discord.Partials.message,
        discord.Partials.channel,
        discord.Partials.Reaction
    ],
});

// Menssagem pra quando der certo, se Deus quiser...
client.once("ready", () => {
    console.log(`Login Efetuado com Sucesso como ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: 'Minecraft (Fake)', type: ActivityType.Playing }], // Atividade e tipo
        status: 'dnd', // Status: 'online', 'idle', 'dnd', ou 'invisible'
    });
});


// Atribui/Armazena o histórico de conversas
const chatHistory = new Map();

client.on("messageCreate", async (message) => {
    try {

        if (message.author.bot || (message.channel.id !== idCanal && message.channel.id !== idCanal1)) return;
        if (!chatHistory.has(message.channel.id)) {
            const chat = await model.startChat({ history: [] });
            chatHistory.set(message.channel.id, chat);
        }

        const chat = chatHistory.get(message.channel.id);
        const autName = message.author.displayName;
        const nameAut = autName[0].toUpperCase() + autName.substr(1);


        // Gera resposta com o prompt e histórico de contexto
        const promptPersonalizado = `Responda à mensagem '${message.cleanContent}' com tom casual, Lembresse o Usuário que falou comigo é ${nameAut},como se fosse a Miku Nakano.`;

        const result = await chat.sendMessage(promptPersonalizado);
        const responseText = result.response.text();

        // Envia a resposta para o canal do Discord
        await message.reply({
            content: responseText,
        });

    } catch (error) {
        console.error(error);
    }
});


client.login(config.discord.token);

process.on('unhandledRejection', (reason, p) => {
    console.error('[ Event Error: unhandledRejection ]', p, 'reason', reason);
});
process.on('uncaughtException', (err, origin) => {
    console.error('[ Event Error: uncaughtException ]', err, origin);
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error('[ Event Error: uncaughtExceptionMonitor ]', err, origin);
});

