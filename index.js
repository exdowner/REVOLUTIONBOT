const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

// ============ CONFIGURAÇÃO DA GROQ ============
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

if (!GROQ_API_KEY) {
  console.warn('⚠️ GROQ_API_KEY não configurada! O comando /ia não vai funcionar.');
}

// ============ FUNÇÃO IA ============
async function callGroqAI(mensagem, contexto = '') {
  if (!GROQ_API_KEY) return '❌ API da Groq não configurada.';

  try {
    const systemPrompt = contexto || 'Você é um assistente útil e inteligente chamado REVOLUTION. Responda de forma clara, direta e em português. Você pode ajudar com programação, dúvidas gerais, piadas, conselhos e muito mais.';
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: mensagem }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', errorText);
      return `❌ Erro na API: ${response.status}`;
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }
    return '❌ Erro ao processar sua pergunta. Tente novamente.';
  } catch (error) {
    console.error('❌ ERRO NA IA:', error.message);
    return `❌ Erro ao conectar com a IA: ${error.message}`;
  }
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

// ============ FUNÇÕES DE UTILIDADE ============
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// ============ SISTEMA DE XP ============
let xpData = {};
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

// ============ COMANDOS ORIGINAIS (26) ============

// 1. PING
client.commands.set('ping', {
  execute: async (interaction) => {
    const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! Latência: ${latency}ms | API: ${Math.round(client.ws.ping)}ms`);
  }
});

// 2. AVATAR
client.commands.set('avatar', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const embed = new EmbedBuilder().setTitle(`🖼️ Avatar de ${user.tag}`).setImage(user.displayAvatarURL({ size: 1024, dynamic: true })).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 3. USERINFO
client.commands.set('userinfo', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder().setTitle(`👤 Info de ${user.tag}`).setThumbnail(user.displayAvatarURL()).setColor('#0099ff')
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Criou conta', value: new Date(user.createdAt).toLocaleDateString('pt-BR'), inline: true },
        { name: '📅 Entrou no servidor', value: member ? new Date(member.joinedAt).toLocaleDateString('pt-BR') : 'N/A', inline: true },
        { name: '🎭 Cargos', value: member ? member.roles.cache.size - 1 : 0, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 4. SERVERINFO
client.commands.set('serverinfo', {
  execute: async (interaction) => {
    const guild = interaction.guild;
    const embed = new EmbedBuilder().setTitle(`📊 Info do Servidor`).setThumbnail(guild.iconURL()).setColor('#0099ff')
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

// 5. BOTINFO
client.commands.set('botinfo', {
  execute: async (interaction) => {
    const embed = new EmbedBuilder().setTitle('🤖 REVOLUTION BOT').setColor('#ff0000')
      .addFields(
        { name: '📊 Servidores', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Usuários', value: `${client.users.cache.size}`, inline: true },
        { name: '⏱️ Online há', value: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`, inline: true },
        { name: '📋 Comandos', value: `${client.commands.size}`, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 6. 8BALL
client.commands.set('8ball', {
  execute: async (interaction) => {
    const respostas = ['Sim', 'Não', 'Talvez', 'Com certeza!', 'Nem pensar!', 'Provavelmente', 'Não conte com isso', 'Claro que sim!', 'As estrelas dizem que sim', 'Melhor não contar'];
    const embed = new EmbedBuilder().setTitle('🎱 8BALL').setDescription(`🎱 ${respostas[Math.floor(Math.random() * respostas.length)]}`).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 7. SHIP
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

// 8. RATEWAIFU
client.commands.set('ratewaifu', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const nota = getRandomInt(0, 100);
    const embed = new EmbedBuilder().setTitle('💯 RATE WAIFU').setDescription(`💖 ${user} é ${nota}% waifu!`).setColor('#ff69b4').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 9. COINFLIP
client.commands.set('coinflip', {
  execute: async (interaction) => {
    const resultado = Math.random() > 0.5 ? 'Cara' : 'Coroa';
    const embed = new EmbedBuilder().setTitle('🪙 COIN FLIP').setDescription(`🪙 ${resultado}!`).setColor('#ffd700').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 10. DICE
client.commands.set('dice', {
  execute: async (interaction) => {
    const faces = interaction.options.getInteger('faces') || 6;
    const resultado = getRandomInt(1, faces);
    const embed = new EmbedBuilder().setTitle('🎲 DADO').setDescription(`🎲 Resultado: **${resultado}** (${faces} faces)`).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 11. RPS
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

// 12. SAY
client.commands.set('say', {
  execute: async (interaction) => {
    const mensagem = interaction.options.getString('mensagem');
    await interaction.reply({ content: mensagem });
  }
});

// 13. ENQUETE
client.commands.set('enquete', {
  execute: async (interaction) => {
    const pergunta = interaction.options.getString('pergunta');
    const embed = new EmbedBuilder().setTitle('📊 ENQUETE').setDescription(pergunta).setColor('#0099ff').setFooter({ text: `Por ${interaction.user.tag}` }).setTimestamp();
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('👍');
    await msg.react('👎');
  }
});

// 14. INVITE
client.commands.set('invite', {
  execute: async (interaction) => {
    const embed = new EmbedBuilder().setTitle('📨 CONVIDE O BOT').setColor('#0099ff').setDescription(`[Clique aqui para convidar](https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands)`);
    await interaction.reply({ embeds: [embed] });
  }
});

// 15. CLEAR
client.commands.set('clear', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const quantidade = interaction.options.getInteger('quantidade') || 10;
    const deleted = await interaction.channel.bulkDelete(quantidade, true);
    const embed = new EmbedBuilder().setTitle('🧹 MENSAGENS APAGADAS').setColor('#0099ff').addFields({ name: 'Quantidade', value: `${deleted.size} mensagens`, inline: true });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// 16. SLOWMODE
client.commands.set('slowmode', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const segundos = interaction.options.getInteger('segundos');
    await interaction.channel.setRateLimitPerUser(segundos);
    const embed = new EmbedBuilder().setTitle('🐢 SLOWMODE ATIVADO').setColor('#0099ff').addFields({ name: 'Tempo', value: `${segundos} segundos`, inline: true });
    await interaction.reply({ embeds: [embed] });
  }
});

// 17. LOCK
client.commands.set('lock', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
    const embed = new EmbedBuilder().setTitle('🔒 CANAL BLOQUEADO').setColor('#ff0000').setDescription(`O canal ${interaction.channel} foi bloqueado!`);
    await interaction.reply({ embeds: [embed] });
  }
});

// 18. UNLOCK
client.commands.set('unlock', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
    const embed = new EmbedBuilder().setTitle('🔓 CANAL DESBLOQUEADO').setColor('#00ff00').setDescription(`O canal ${interaction.channel} foi desbloqueado!`);
    await interaction.reply({ embeds: [embed] });
  }
});

// 19. KICK
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

// 20. BAN
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

// 21. MUTE
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

// 22. UNMUTE
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

// 23. WARN
let warns = {};
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

// 24. WARNS
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

// 25. AUTOROLE
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

// 26. AUTOROLE EVENT
client.on('guildMemberAdd', async (member) => {
  if (client.autoroles && client.autoroles[member.guild.id]) {
    try { await member.roles.add(client.autoroles[member.guild.id]); } catch (error) {}
  }
});

// ============ 30 NOVOS COMANDOS ============

// 27. UPTIME
client.commands.set('uptime', {
  execute: async (interaction) => {
    const days = Math.floor(process.uptime() / 86400);
    const hours = Math.floor((process.uptime() % 86400) / 3600);
    const minutes = Math.floor((process.uptime() % 3600) / 60);
    const seconds = Math.floor(process.uptime() % 60);
    const embed = new EmbedBuilder().setTitle('⏱️ UPTIME').setDescription(`🟢 **${days}d ${hours}h ${minutes}m ${seconds}s**`).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 28. MEMBERS
client.commands.set('members', {
  execute: async (interaction) => {
    const total = interaction.guild.memberCount;
    const bots = interaction.guild.members.cache.filter(m => m.user.bot).size;
    const humans = total - bots;
    const embed = new EmbedBuilder().setTitle('👥 MEMBROS').setColor('#0099ff')
      .addFields(
        { name: '👤 Total', value: `${total}`, inline: true },
        { name: '🤖 Bots', value: `${bots}`, inline: true },
        { name: '👨 Humanos', value: `${humans}`, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 29. ROLES
client.commands.set('roles', {
  execute: async (interaction) => {
    const roles = interaction.guild.roles.cache.filter(r => r.name !== '@everyone').sort((a, b) => b.position - a.position);
    const list = roles.map(r => `🎭 ${r.name}`).join('\n');
    const embed = new EmbedBuilder().setTitle('🎭 CARGOS').setDescription(list || 'Nenhum cargo').setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 30. EMOJI
client.commands.set('emoji', {
  execute: async (interaction) => {
    const emojis = interaction.guild.emojis.cache.map(e => `${e}`).join(' ') || 'Nenhum emoji';
    const embed = new EmbedBuilder().setTitle('😀 EMOJIS').setDescription(emojis).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 31. BOOST
client.commands.set('boost', {
  execute: async (interaction) => {
    const boosts = interaction.guild.premiumSubscriptionCount || 0;
    const level = interaction.guild.premiumTier || 0;
    const embed = new EmbedBuilder().setTitle('💎 BOOST').setColor('#ff69b4')
      .addFields(
        { name: '🚀 Nível', value: `${level}`, inline: true },
        { name: '⚡ Boosts', value: `${boosts}`, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 32. ROLEINFO
client.commands.set('roleinfo', {
  execute: async (interaction) => {
    const role = interaction.options.getRole('cargo');
    if (!role) return interaction.reply({ content: '❌ Cargo não encontrado!', ephemeral: true });
    const embed = new EmbedBuilder().setTitle(`🎭 Info de ${role.name}`).setColor(role.color || '#0099ff')
      .addFields(
        { name: '🆔 ID', value: role.id, inline: true },
        { name: '🎨 Cor', value: role.hexColor, inline: true },
        { name: '👥 Membros', value: role.members.size, inline: true },
        { name: '📅 Criado', value: role.createdAt.toLocaleDateString('pt-BR'), inline: true },
        { name: '🔝 Posição', value: `${role.position}`, inline: true },
        { name: '📌 Menção', value: role.toString(), inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 33. CHANNELINFO
client.commands.set('channelinfo', {
  execute: async (interaction) => {
    const channel = interaction.options.getChannel('canal') || interaction.channel;
    const embed = new EmbedBuilder().setTitle(`📢 Info de ${channel.name}`).setColor('#0099ff')
      .addFields(
        { name: '🆔 ID', value: channel.id, inline: true },
        { name: '📌 Tipo', value: channel.type, inline: true },
        { name: '📅 Criado', value: channel.createdAt.toLocaleDateString('pt-BR'), inline: true },
        { name: '👥 Tópico', value: channel.topic || 'Nenhum', inline: false }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 34. AFK
client.commands.set('afk', {
  execute: async (interaction) => {
    const motivo = interaction.options.getString('motivo') || 'AFK';
    if (!client.afk) client.afk = {};
    client.afk[interaction.user.id] = { motivo, data: new Date() };
    const embed = new EmbedBuilder().setTitle('🛌 AFK ATIVADO').setDescription(`${interaction.user} está AFK: ${motivo}`).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 35. REMINDER
client.commands.set('reminder', {
  execute: async (interaction) => {
    const tempo = interaction.options.getInteger('minutos');
    const texto = interaction.options.getString('texto');
    await interaction.reply({ content: `⏰ Lembrete em ${tempo} minutos: ${texto}`, ephemeral: true });
    setTimeout(() => {
      interaction.user.send(`⏰ **Lembrete:** ${texto}`);
    }, tempo * 60 * 1000);
  }
});

// 36. POLL
client.commands.set('poll', {
  execute: async (interaction) => {
    const pergunta = interaction.options.getString('pergunta');
    const embed = new EmbedBuilder().setTitle('📊 ENQUETE').setDescription(pergunta).setColor('#0099ff').setFooter({ text: `Por ${interaction.user.tag}` }).setTimestamp();
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('✅');
    await msg.react('❌');
    await msg.react('🤷');
  }
});

// 37. SUGGEST
client.commands.set('suggest', {
  execute: async (interaction) => {
    const sugestao = interaction.options.getString('sugestao');
    const embed = new EmbedBuilder().setTitle('💡 SUGESTÃO').setDescription(sugestao).setColor('#0099ff').setFooter({ text: `Por ${interaction.user.tag}` }).setTimestamp();
    const channel = interaction.guild.channels.cache.find(c => c.name === 'sugestoes' || c.name === 'sugestões');
    if (channel) {
      const msg = await channel.send({ embeds: [embed] });
      await msg.react('👍');
      await msg.react('👎');
      await interaction.reply({ content: '✅ Sugestão enviada!', ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed] });
      const msg = await interaction.fetchReply();
      await msg.react('👍');
      await msg.react('👎');
    }
  }
});

// 38. REPORT
client.commands.set('report', {
  execute: async (interaction) => {
    const usuario = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo');
    const embed = new EmbedBuilder().setTitle('🚨 REPORT').setColor('#ff0000')
      .addFields(
        { name: '👤 Usuário', value: usuario.tag, inline: true },
        { name: '📋 Motivo', value: motivo, inline: true },
        { name: '🛡️ Reportado por', value: interaction.user.tag, inline: true }
      ).setTimestamp();
    const channel = interaction.guild.channels.cache.find(c => c.name === 'reports' || c.name === 'reportes');
    if (channel) {
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Report enviado!', ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
});

// 39. RANDOM
client.commands.set('random', {
  execute: async (interaction) => {
    const min = interaction.options.getInteger('min') || 1;
    const max = interaction.options.getInteger('max') || 100;
    const resultado = getRandomInt(min, max);
    const embed = new EmbedBuilder().setTitle('🎲 NÚMERO ALEATÓRIO').setDescription(`🔢 **${resultado}** (${min} - ${max})`).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 40. CHOICE
client.commands.set('choice', {
  execute: async (interaction) => {
    const opcoes = interaction.options.getString('opcoes').split(',').map(o => o.trim());
    const escolha = opcoes[Math.floor(Math.random() * opcoes.length)];
    const embed = new EmbedBuilder().setTitle('🤔 ESCOLHA').setDescription(`✅ **${escolha}**`).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 41. MATH
client.commands.set('math', {
  execute: async (interaction) => {
    const expressao = interaction.options.getString('expressao');
    try {
      const resultado = eval(expressao);
      const embed = new EmbedBuilder().setTitle('🧮 CALCULADORA').setColor('#0099ff')
        .addFields(
          { name: '📝 Expressão', value: expressao, inline: false },
          { name: '✅ Resultado', value: `${resultado}`, inline: false }
        ).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Expressão inválida!', ephemeral: true });
    }
  }
});

// 42. TIMESTAMP
client.commands.set('timestamp', {
  execute: async (interaction) => {
    const embed = new EmbedBuilder().setTitle('🕐 TIMESTAMP').setColor('#0099ff')
      .addFields(
        { name: '📅 Data/Hora', value: new Date().toLocaleString('pt-BR'), inline: false },
        { name: '🆙 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}>`, inline: false }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 43. QRCODE
client.commands.set('qrcode', {
  execute: async (interaction) => {
    const texto = interaction.options.getString('texto');
    const embed = new EmbedBuilder().setTitle('📱 QR CODE').setColor('#0099ff')
      .setImage(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(texto)}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 44. TRANSLATE (simulação)
client.commands.set('translate', {
  execute: async (interaction) => {
    const texto = interaction.options.getString('texto');
    const embed = new EmbedBuilder().setTitle('🌐 TRADUÇÃO (Simulada)').setColor('#0099ff')
      .addFields(
        { name: '📝 Original', value: texto, inline: false },
        { name: '✅ Tradução', value: `[${texto}] (simulação)`, inline: false }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 45. WEATHER (simulação)
client.commands.set('weather', {
  execute: async (interaction) => {
    const cidade = interaction.options.getString('cidade');
    const embed = new EmbedBuilder().setTitle(`🌤️ CLIMA - ${cidade}`).setColor('#0099ff')
      .addFields(
        { name: '🌡️ Temperatura', value: `${getRandomInt(15, 35)}°C`, inline: true },
        { name: '💧 Umidade', value: `${getRandomInt(40, 90)}%`, inline: true },
        { name: '🌬️ Vento', value: `${getRandomInt(5, 30)} km/h`, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 46. URBAN (simulação)
client.commands.set('urban', {
  execute: async (interaction) => {
    const palavra = interaction.options.getString('palavra');
    const embed = new EmbedBuilder().setTitle(`📚 URBAN - ${palavra}`).setColor('#0099ff')
      .setDescription(`**Significado:** ${palavra} é uma palavra que significa algo (simulação).\n\n**Exemplo:** "Eu uso ${palavra} todo dia!"`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 47. WHOIS
client.commands.set('whois', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder().setTitle(`🔍 WHOIS - ${user.tag}`).setThumbnail(user.displayAvatarURL()).setColor('#0099ff')
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Conta criada', value: user.createdAt.toLocaleDateString('pt-BR'), inline: true },
        { name: '📅 Entrou', value: member ? member.joinedAt.toLocaleDateString('pt-BR') : 'N/A', inline: true },
        { name: '🎭 Cargos', value: member ? member.roles.cache.size - 1 : 0, inline: true },
        { name: '🤖 Bot', value: user.bot ? 'Sim' : 'Não', inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 48. GUILDICON
client.commands.set('guildicon', {
  execute: async (interaction) => {
    const icon = interaction.guild.iconURL({ size: 1024 });
    if (!icon) return interaction.reply({ content: '❌ Este servidor não tem ícone!', ephemeral: true });
    const embed = new EmbedBuilder().setTitle(`🖼️ Ícone de ${interaction.guild.name}`).setImage(icon).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 49. BANNER (usuário)
client.commands.set('banner', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ Usuário não encontrado!', ephemeral: true });
    const banner = member.bannerURL({ size: 1024 });
    if (!banner) return interaction.reply({ content: '❌ Este usuário não tem banner!', ephemeral: true });
    const embed = new EmbedBuilder().setTitle(`🎨 Banner de ${user.tag}`).setImage(banner).setColor('#0099ff').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 50. NICK
client.commands.set('nick', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const user = interaction.options.getUser('usuario');
    const nickname = interaction.options.getString('nickname');
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ Usuário não encontrado!', ephemeral: true });
    await member.setNickname(nickname);
    const embed = new EmbedBuilder().setTitle('✏️ NICK ALTERADO').setColor('#0099ff')
      .addFields(
        { name: '👤 Usuário', value: user.tag, inline: true },
        { name: '📛 Novo nick', value: nickname, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 51. VOICE
client.commands.set('voice', {
  execute: async (interaction) => {
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member.voice.channel) return interaction.reply({ content: '❌ Você não está em um canal de voz!', ephemeral: true });
    const channel = member.voice.channel;
    const members = channel.members.map(m => m.user.tag).join('\n');
    const embed = new EmbedBuilder().setTitle(`🔊 CANAL DE VOZ - ${channel.name}`).setColor('#0099ff')
      .addFields(
        { name: '👥 Membros', value: members || 'Nenhum', inline: false },
        { name: '📊 Total', value: `${channel.members.size} membros`, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 52. DM
client.commands.set('dm', {
  execute: async (interaction) => {
    if (interaction.user.id !== process.env.OWNER_ID) return interaction.reply({ content: '❌ Apenas o dono!', ephemeral: true });
    const user = interaction.options.getUser('usuario');
    const mensagem = interaction.options.getString('mensagem');
    try {
      await user.send(mensagem);
      await interaction.reply({ content: '✅ Mensagem enviada!', ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: `❌ Erro: ${error.message}`, ephemeral: true });
    }
  }
});

// 53. ANNOUNCE
client.commands.set('announce', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const mensagem = interaction.options.getString('mensagem');
    const embed = new EmbedBuilder().setTitle('📢 ANÚNCIO').setDescription(mensagem).setColor('#ff0000').setFooter({ text: `Por ${interaction.user.tag}` }).setTimestamp();
    await interaction.reply({ content: '@everyone', embeds: [embed] });
  }
});

// 54. GIVEAWAY (simples)
client.commands.set('giveaway', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    const premio = interaction.options.getString('premio');
    const tempo = interaction.options.getInteger('minutos');
    const embed = new EmbedBuilder().setTitle('🎉 GIVEAWAY').setDescription(`**Prêmio:** ${premio}\n**Tempo:** ${tempo} minutos\n\nReaja com 🎉 para participar!`).setColor('#ff69b4').setFooter({ text: `Por ${interaction.user.tag}` }).setTimestamp();
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('🎉');
    setTimeout(async () => {
      const fetched = await msg.fetch();
      const reactions = fetched.reactions.cache.get('🎉');
      if (reactions) {
        const users = await reactions.users.fetch();
        const participants = users.filter(u => !u.bot);
        if (participants.size > 0) {
          const winner = participants.random();
          await interaction.followUp(`🎉 **${winner}** ganhou o sorteio! Prêmio: ${premio}`);
        } else {
          await interaction.followUp('❌ Ninguém participou do sorteio!');
        }
      }
    }, tempo * 60 * 1000);
  }
});

// 55. XP (ver xp)
client.commands.set('xp', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const data = xpData[interaction.guild.id]?.[user.id];
    if (!data) return interaction.reply({ content: '❌ Este usuário não tem XP!', ephemeral: true });
    const embed = new EmbedBuilder().setTitle(`📊 XP de ${user.tag}`).setColor('#0099ff')
      .addFields(
        { name: '⭐ Nível', value: `${data.level}`, inline: true },
        { name: '📈 XP', value: `${data.xp} / ${(data.level + 1) * 100}`, inline: true }
      ).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 56. LEADERBOARD
client.commands.set('leaderboard', {
  execute: async (interaction) => {
    const guildData = xpData[interaction.guild.id];
    if (!guildData) return interaction.reply({ content: '❌ Nenhum dado de XP!', ephemeral: true });
    const sorted = Object.entries(guildData).sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp).slice(0, 10);
    let desc = '';
    for (let i = 0; i < sorted.length; i++) {
      const [userId, data] = sorted[i];
      const user = await client.users.fetch(userId).catch(() => null);
      desc += `**${i+1}.** ${user ? user.tag : 'Desconhecido'} - Nível ${data.level} (${data.xp} XP)\n`;
    }
    const embed = new EmbedBuilder().setTitle('🏆 LEADERBOARD').setDescription(desc || 'Nenhum usuário').setColor('#ffd700').setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// ============ COMANDO IA (57) ============

// 57. IA
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
        .setDescription(resposta.length > 4000 ? resposta.substring(0, 4000) + '...' : resposta)
        .addFields(
          { name: '📝 PERGUNTA', value: pergunta.length > 100 ? pergunta.substring(0, 100) + '...' : pergunta, inline: false }
        )
        .setFooter({ text: 'REVOLUTION - INTELIGÊNCIA ARTIFICIAL' })
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
      
    } catch (error) {
      await interaction.editReply({
        content: `❌ ERRO AO PROCESSAR SUA PERGUNTA: ${error.message}`,
        embeds: []
      });
      console.error('ERRO NA IA:', error);
    }
  }
});

// ============ EVENTO DE XP ============
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  const xpGain = getRandomInt(1, 5);
  const leveledUp = await addXp(message.author.id, message.guild.id, xpGain);
  if (leveledUp) {
    const level = xpData[message.guild.id][message.author.id].level;
    const embed = new EmbedBuilder().setTitle('⬆️ LEVEL UP!').setDescription(`🎉 ${message.author} subiu para o nível **${level}**!`).setColor('#00ff00');
    await message.channel.send({ embeds: [embed] });
  }
});

// ============ EVENTOS ============

client.on('ready', () => {
  console.log(`🚀 Bot ${client.user.tag} está ONLINE!`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`📋 Comandos: ${client.commands.size}`);
  console.log(`🤖 IA CARREGADA! Use /ia pergunta:`);
  
  client.user.setPresence({
    activities: [{
      name: `${client.commands.size} comandos | REVOLUTION`,
      type: 3,
      state: 'Use /ia para perguntar'
    }],
    status: 'online'
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  console.log(`📥 Comando: ${interaction.commandName}`);
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({ content: '❌ COMANDO NAO ENCONTRADO!', ephemeral: true });
  }
  try {
    await command.execute(interaction);
    console.log(`✅ Comando executado: ${interaction.commandName}`);
  } catch (error) {
    console.error(`❌ Erro:`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ ERRO AO EXECUTAR COMANDO!', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ ERRO AO EXECUTAR COMANDO!', ephemeral: true });
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