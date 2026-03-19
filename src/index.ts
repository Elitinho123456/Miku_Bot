import { Client, GatewayIntentBits, Partials, EmbedBuilder, Message, ChannelType, ActivityType } from "discord.js";
import dotenv from "dotenv";
import memoryHandler from "./Memory/memoryHandler.js";
import textGenerator from "./Models/textGenerative.js";

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

client.login(process.env.TOKEN);

client.on("clientReady", () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    console.log(`Ready to take off!`);
    client.user?.setPresence({
        activities: [{ name: 'Minecraft (Fake)', type: ActivityType.Playing }],
        status: 'online',
    });
});

client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;

    const isDM = message.channel.type === ChannelType.DM;

    const userId = message.author.id;
    const channelId = isDM ? `dm_${userId}` : message.channelId;
    const userInput = message.content.trim();

    if (userInput.startsWith(PREFIX)) {
        const args = userInput.slice(PREFIX.length).trim().split(/\s+/);
        const command = args.shift()?.toLowerCase();

        switch (command) {
            case COMMANDS.MODEL:
                await handleModelCommand(message, args[0]);
                break;

            case COMMANDS.CLEAR:
                await handleClearCommand(message, channelId);
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

    if (userInput.startsWith('!') || userInput.startsWith('/') || userInput.startsWith('.')) {
        return;
    }

    try {
        memoryHandler.addMessage(channelId, 'user', userInput);

        const history = memoryHandler.getHistory(channelId);

        const model = memoryHandler.getUserModel(userId);

        if ('sendTyping' in message.channel) {
            await message.channel.sendTyping();
        }

        const aiResponse = await textGenerator.generateResponse(userInput, history, model);

        if (aiResponse.success && aiResponse.response) {
            memoryHandler.addMessage(channelId, 'assistant', aiResponse.response);

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

async function handleModelCommand(message: Message, model?: string) {
    const userId = message.author.id;
    const availableModels = textGenerator.getAvailableModels();

    if (!message.guild) {
        if (!model || !availableModels.includes(model)) {
            await message.reply(`Modelo inválido. Modelos disponíveis: ${availableModels.join(', ')}`);
            return;
        }
        memoryHandler.setUserModel(userId, model);
        await message.reply(`✅ Modelo alterado para: ${model}`);
        return;
    }

    if (!model || !availableModels.includes(model)) {
        await message.reply(`Modelo inválido. Modelos disponíveis: ${availableModels.join(', ')}`);
        return;
    }

    memoryHandler.setUserModel(userId, model);
    await message.reply(`✅ Modelo alterado para: ${model}`);
}

async function handleClearCommand(message: Message, channelId: string) {
    memoryHandler.clearHistory(channelId);
    await message.reply('✅ Histórico de conversa limpo com sucesso!');
}

async function showHelp(message: Message) {
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

async function showAvailableModels(message: Message) {
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
