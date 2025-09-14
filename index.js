import { Client, GatewayIntentBits, Partials, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";
import memoryHandler from "./src/Memory/memoryHandler.js";
import textGenerator from "./src/Models/textGenerative.js";

dotenv.config();

const PREFIX = '!miku';

const COMMANDS = {
    HELP: 'ajuda',
    MODEL: 'modelo',
    CLEAR: 'limpar',
    MODELS: 'modelos'
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.Reaction,
    ]
});

// Bot login
client.login(process.env.TOKEN);

// Bot ready event
client.on("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Ready to take off!`);
    client.user.setPresence({
        activities: [{ name: 'Minecraft (Fake)', type: 'Playing' }],
        status: 'online',
    });
});

// Handle incoming messages
client.on('messageCreate', async message => {

    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if message is in DMs or a guild channel
    const isDM = message.channel.type === 'DM';
    
    // If it's a DM, create a channel-like ID using the user's ID
    // This ensures DM conversations are separate from server conversations
    const userId = message.author.id;
    const channelId = isDM ? `dm_${userId}` : message.channelId;
    const userInput = message.content.trim();

    // Check for commands
    if (userInput.startsWith(PREFIX)) {

        const args = userInput.slice(PREFIX.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        switch (command) {
            case COMMANDS.MODEL:
                await handleModelCommand(message, args[0]);
                break;

            case COMMANDS.CLEAR:
                await handleClearCommand(message);
                break;

            case COMMANDS.HELP:
            case 'help':
                await showHelp(message);
                break;

            case COMMANDS.MODELS:
                await showAvailableModels(message);
                break;

            default:
                await showHelp(message);
        }
        return;
    }

    // Ignore messages that start with other bot prefixes
    if (userInput.startsWith('!') || userInput.startsWith('/') || userInput.startsWith('.')) {
        return;
    }

    // Handle AI response
    try {

        // Add user message to history (using channelId for both DMs and guild channels)
        memoryHandler.addMessage(channelId, 'user', userInput);
        
        // Get conversation history for this channel/DM
        const history = memoryHandler.getHistory(channelId);
        
        // Get user's preferred model (using userId to maintain model preference across channels)
        const model = memoryHandler.getUserModel(userId);
        
        // Send typing indicator
        await message.channel.sendTyping();
        
        // Get AI response
        const aiResponse = await textGenerator.generateResponse(userInput, history, model);
        
        if (aiResponse.success) {

            // Add AI response to history (using channelId for both DMs and guild channels)
            memoryHandler.addMessage(channelId, 'assistant', aiResponse.response);
            
            // Split long messages to avoid Discord's 2000 character limit
            const maxLength = 1900;

            if (aiResponse.response.length > maxLength) {

                const chunks = [];

                for (let i = 0; i < aiResponse.response.length; i += maxLength) {
                    chunks.push(aiResponse.response.substring(i, i + maxLength));
                }
                
                for (const chunk of chunks) {
                    await message.reply(chunk);
                }

            } else {

                await message.reply(aiResponse.response);

            }

        } else {

            await message.reply('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.');
            console.error('AI Error:', aiResponse.error);

        }

    } catch (error) {
        console.error('Error in message handler:', error);
        await message.reply('Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.');
    }
});

// Command Handlers
async function handleModelCommand(message, model) {

    const userId = message.author.id;
    const availableModels = textGenerator.getAvailableModels();
    
    // Check if user is in DMs
    if (!message.guild) {
        // In DMs, we can reply directly
        if (!model || !availableModels.includes(model)) {
            return message.reply(`Modelo inválido. Modelos disponíveis: ${availableModels.join(', ')}`);
        }
        memoryHandler.setUserModel(userId, model);
        return message.reply(`✅ Modelo alterado para: ${model}`);
    }
    
    if (!model || !availableModels.includes(model)) {
        return message.reply(`Modelo inválido. Modelos disponíveis: ${availableModels.join(', ')}`);
    }
    
    memoryHandler.setUserModel(userId, model);
    await message.reply(`✅ Modelo alterado para: ${model}`);

}

async function handleClearCommand(message) {

    const userId = message.author.id;
    const isDM = !message.guild;
    const channelId = isDM ? `dm_${userId}` : message.channelId;

    memoryHandler.clearHistory(channelId);
    await message.reply('✅ Histórico de conversa limpo com sucesso!');

}

async function showHelp(message) {
    const helpEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🤖 Comandos do Miku Bot')
        .setDescription('Aqui estão os comandos disponíveis:')
        .addFields(
            { name: `\`${PREFIX} ${COMMANDS.MODEL} [modelo]\``, value: 'Muda o modelo de IA (flash ou pro)', inline: true },
            { name: `\`${PREFIX} ${COMMANDS.CLEAR}\``, value: 'Limpa o histórico de conversa', inline: true },
            { name: `\`${PREFIX} ${COMMANDS.MODELS}\``, value: 'Mostra os modelos disponíveis', inline: true },
            { name: `\`${PREFIX} ${COMMANDS.HELP}\``, value: 'Mostra esta mensagem de ajuda', inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Chat normal', value: 'Apenas digite sua mensagem para conversar com a Miku!' }
        )
        .setFooter({ text: 'Miku Bot - Sua assistente virtual' })
        .setTimestamp();

    await message.reply({ embeds: [helpEmbed] });
}

async function showAvailableModels(message) {

    const models = textGenerator.getAvailableModels();
    const currentModel = memoryHandler.getUserModel(message.author.id);
    
    const modelList = models.map(model => 
        `${model === currentModel ? '✅' : '•'} ${model}`
    ).join('\n');
    
    const embed = new EmbedBuilder()
        .setTitle('🤖 Modelos Disponíveis')
        .setDescription(modelList)
        .setFooter({ text: `Use ${PREFIX} ${COMMANDS.MODEL} [modelo] para mudar` })
        .setColor('#4CAF50');
        
    await message.reply({ embeds: [embed] });

}
