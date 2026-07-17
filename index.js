const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// ============ CLIENT ============
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ============ COMANDOS ============
client.commands = new Map();

// /ping
client.commands.set('ping', {
  execute: async (interaction) => {
    const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! Latência: ${latency}ms | API: ${Math.round(client.ws.ping)}ms`);
  }
});

// ============ EVENTOS ============

client.on('ready', () => {
  console.log(`🚀 Bot ${client.user.tag} está ONLINE!`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`📋 Comandos: ${client.commands.size}`);
  
  client.user.setPresence({
    activities: [{
      name: 'REVOLUTION BOT | /ping',
      type: 3,
      state: 'Use /ping para testar'
    }],
    status: 'online'
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  console.log(`📥 Comando recebido: ${interaction.commandName}`);

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: '❌ COMANDO NAO ENCONTRADO!',
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction);
    console.log(`✅ Comando executado: ${interaction.commandName}`);
  } catch (error) {
    console.error(`❌ Erro no comando ${interaction.commandName}:`, error);
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ 
        content: '❌ ERRO AO EXECUTAR COMANDO!', 
        ephemeral: true 
      });
    } else {
      await interaction.reply({ 
        content: '❌ ERRO AO EXECUTAR COMANDO!', 
        ephemeral: true 
      });
    }
  }
});

// ============ LOGIN ============

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.error('❌ TOKEN NAO ENCONTRADO!');
  process.exit(1);
}

client.login(TOKEN).catch(error => {
  console.error(`❌ Erro ao fazer login: ${error.message}`);
  process.exit(1);
});