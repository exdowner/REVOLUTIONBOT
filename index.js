const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
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

// ============ FUNÇÕES DE UTILIDADE ============
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ============ COMANDOS ============

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
    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar de ${user.tag}`)
      .setImage(user.displayAvatarURL({ size: 1024, dynamic: true }))
      .setColor('#0099ff')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 3. USERINFO
client.commands.set('userinfo', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    const embed = new EmbedBuilder()
      .setTitle(`👤 Info de ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .setColor('#0099ff')
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Criou conta', value: new Date(user.createdAt).toLocaleDateString('pt-BR'), inline: true },
        { name: '📅 Entrou no servidor', value: member ? new Date(member.joinedAt).toLocaleDateString('pt-BR') : 'N/A', inline: true },
        { name: '🎭 Cargos', value: member ? member.roles.cache.size - 1 : 0, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 4. SERVERINFO
client.commands.set('serverinfo', {
  execute: async (interaction) => {
    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setTitle(`📊 Info do Servidor`)
      .setThumbnail(guild.iconURL())
      .setColor('#0099ff')
      .addFields(
        { name: '📛 Nome', value: guild.name, inline: true },
        { name: '👑 Dono', value: guild.members.cache.get(guild.ownerId)?.user.tag || 'N/A', inline: true },
        { name: '👥 Membros', value: `${guild.memberCount}`, inline: true },
        { name: '📅 Criado em', value: new Date(guild.createdAt).toLocaleDateString('pt-BR'), inline: true },
        { name: '💬 Canais', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 Cargos', value: `${guild.roles.cache.size}`, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 5. BOTINFO
client.commands.set('botinfo', {
  execute: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('🤖 REVOLUTION BOT')
      .setColor('#ff0000')
      .addFields(
        { name: '📊 Servidores', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Usuários', value: `${client.users.cache.size}`, inline: true },
        { name: '⏱️ Online há', value: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`, inline: true },
        { name: '📋 Comandos', value: `${client.commands.size}`, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 6. 8BALL
client.commands.set('8ball', {
  execute: async (interaction) => {
    const respostas = ['Sim', 'Não', 'Talvez', 'Com certeza!', 'Nem pensar!', 'Provavelmente', 'Não conte com isso', 'Claro que sim!', 'As estrelas dizem que sim', 'Melhor não contar'];
    const embed = new EmbedBuilder()
      .setTitle('🎱 8BALL')
      .setDescription(`🎱 ${respostas[Math.floor(Math.random() * respostas.length)]}`)
      .setColor('#0099ff')
      .setTimestamp();
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
    const embed = new EmbedBuilder()
      .setTitle('💕 SHIP')
      .setDescription(`💕 ${user1} + ${user2} = ${porcentagem}% ${emoji}`)
      .setColor('#ff69b4')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 8. RATEWAIFU
client.commands.set('ratewaifu', {
  execute: async (interaction) => {
    const user = interaction.options.getUser('usuario') || interaction.user;
    const nota = getRandomInt(0, 100);
    const embed = new EmbedBuilder()
      .setTitle('💯 RATE WAIFU')
      .setDescription(`💖 ${user} é ${nota}% waifu!`)
      .setColor('#ff69b4')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 9. COINFLIP
client.commands.set('coinflip', {
  execute: async (interaction) => {
    const resultado = Math.random() > 0.5 ? 'Cara' : 'Coroa';
    const embed = new EmbedBuilder()
      .setTitle('🪙 COIN FLIP')
      .setDescription(`🪙 ${resultado}!`)
      .setColor('#ffd700')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 10. DICE
client.commands.set('dice', {
  execute: async (interaction) => {
    const faces = interaction.options.getInteger('faces') || 6;
    const resultado = getRandomInt(1, faces);
    const embed = new EmbedBuilder()
      .setTitle('🎲 DADO')
      .setDescription(`🎲 Resultado: **${resultado}** (${faces} faces)`)
      .setColor('#0099ff')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 11. RPS (Pedra Papel Tesoura)
client.commands.set('rps', {
  execute: async (interaction) => {
    const escolha = interaction.options.getString('escolha');
    const opcoes = ['pedra', 'papel', 'tesoura'];
    const botEscolha = opcoes[Math.floor(Math.random() * opcoes.length)];
    let resultado;
    if (escolha === botEscolha) resultado = 'Empate!';
    else if ((escolha === 'pedra' && botEscolha === 'tesoura') || (escolha === 'papel' && botEscolha === 'pedra') || (escolha === 'tesoura' && botEscolha === 'papel')) resultado = 'Você ganhou! 🎉';
    else resultado = 'Você perdeu! 😢';
    const embed = new EmbedBuilder()
      .setTitle('✊🖐️✌️ PEDRA PAPEL TESOURA')
      .setDescription(`**Você:** ${escolha}\n**Bot:** ${botEscolha}\n\n**Resultado:** ${resultado}`)
      .setColor('#0099ff')
      .setTimestamp();
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
    const embed = new EmbedBuilder()
      .setTitle('📊 ENQUETE')
      .setDescription(pergunta)
      .setColor('#0099ff')
      .setFooter({ text: `Por ${interaction.user.tag}` })
      .setTimestamp();
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('👍');
    await msg.react('👎');
  }
});

// 14. INVITE
client.commands.set('invite', {
  execute: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle('📨 CONVIDE O BOT')
      .setColor('#0099ff')
      .setDescription(`[Clique aqui para convidar](https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands)`);
    await interaction.reply({ embeds: [embed] });
  }
});

// 15. CLEAR
client.commands.set('clear', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    const quantidade = interaction.options.getInteger('quantidade') || 10;
    const deleted = await interaction.channel.bulkDelete(quantidade, true);
    const embed = new EmbedBuilder()
      .setTitle('🧹 MENSAGENS APAGADAS')
      .setColor('#0099ff')
      .addFields({ name: 'Quantidade', value: `${deleted.size} mensagens`, inline: true });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// 16. SLOWMODE
client.commands.set('slowmode', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    const segundos = interaction.options.getInteger('segundos');
    await interaction.channel.setRateLimitPerUser(segundos);
    const embed = new EmbedBuilder()
      .setTitle('🐢 SLOWMODE ATIVADO')
      .setColor('#0099ff')
      .addFields({ name: 'Tempo', value: `${segundos} segundos`, inline: true });
    await interaction.reply({ embeds: [embed] });
  }
});

// 17. LOCK
client.commands.set('lock', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
    const embed = new EmbedBuilder()
      .setTitle('🔒 CANAL BLOQUEADO')
      .setColor('#ff0000')
      .setDescription(`O canal ${interaction.channel} foi bloqueado!`);
    await interaction.reply({ embeds: [embed] });
  }
});

// 18. UNLOCK
client.commands.set('unlock', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });
    const embed = new EmbedBuilder()
      .setTitle('🔓 CANAL DESBLOQUEADO')
      .setColor('#00ff00')
      .setDescription(`O canal ${interaction.channel} foi desbloqueado!`);
    await interaction.reply({ embeds: [embed] });
  }
});

// 19. KICK
client.commands.set('kick', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') || 'Sem motivo';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ Usuário não encontrado!', ephemeral: true });
    if (!member.kickable) return interaction.reply({ content: '❌ Não posso expulsar!', ephemeral: true });
    await member.kick(motivo);
    const embed = new EmbedBuilder()
      .setTitle('👢 USUÁRIO EXPULSO')
      .setColor('#ff9900')
      .addFields(
        { name: 'Usuário', value: user.tag, inline: true },
        { name: 'Motivo', value: motivo, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 20. BAN
client.commands.set('ban', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') || 'Sem motivo';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ Usuário não encontrado!', ephemeral: true });
    if (!member.bannable) return interaction.reply({ content: '❌ Não posso banir!', ephemeral: true });
    await member.ban({ reason: motivo });
    const embed = new EmbedBuilder()
      .setTitle('🔨 USUÁRIO BANIDO')
      .setColor('#ff0000')
      .addFields(
        { name: 'Usuário', value: user.tag, inline: true },
        { name: 'Motivo', value: motivo, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 21. MUTE
client.commands.set('mute', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    const user = interaction.options.getUser('usuario');
    const tempo = interaction.options.getInteger('tempo');
    const motivo = interaction.options.getString('motivo') || 'Sem motivo';
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ Usuário não encontrado!', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: '❌ Não posso mutar!', ephemeral: true });
    await member.timeout(tempo * 60 * 1000, motivo);
    const embed = new EmbedBuilder()
      .setTitle('🔇 USUÁRIO MUTADO')
      .setColor('#ffcc00')
      .addFields(
        { name: 'Usuário', value: user.tag, inline: true },
        { name: 'Tempo', value: `${tempo} minutos`, inline: true },
        { name: 'Motivo', value: motivo, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 22. UNMUTE
client.commands.set('unmute', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    const user = interaction.options.getUser('usuario');
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) return interaction.reply({ content: '❌ Usuário não encontrado!', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: '❌ Não posso desmutar!', ephemeral: true });
    await member.timeout(null);
    const embed = new EmbedBuilder()
      .setTitle('🔊 USUÁRIO DESMUTADO')
      .setColor('#00ff00')
      .addFields({ name: 'Usuário', value: user.tag, inline: true })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 23. WARN
let warns = {};
client.commands.set('warn', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo') || 'Sem motivo';
    if (!warns[interaction.guild.id]) warns[interaction.guild.id] = {};
    if (!warns[interaction.guild.id][user.id]) warns[interaction.guild.id][user.id] = [];
    warns[interaction.guild.id][user.id].push({ motivo, data: new Date(), moderador: interaction.user.tag });
    const embed = new EmbedBuilder()
      .setTitle('⚠️ USUÁRIO AVISADO')
      .setColor('#ff9900')
      .addFields(
        { name: 'Usuário', value: user.tag, inline: true },
        { name: 'Motivo', value: motivo, inline: true },
        { name: 'Total de avisos', value: `${warns[interaction.guild.id][user.id].length}`, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 24. WARNS
client.commands.set('warnlist', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    const user = interaction.options.getUser('usuario');
    if (!warns[interaction.guild.id] || !warns[interaction.guild.id][user.id]) {
      return interaction.reply({ content: '✅ Usuário não tem avisos.', ephemeral: true });
    }
    let desc = '';
    warns[interaction.guild.id][user.id].forEach((w, i) => {
      desc += `**${i+1}.** ${w.motivo} - ${w.moderador} (${new Date(w.data).toLocaleDateString('pt-BR')})\n`;
    });
    const embed = new EmbedBuilder()
      .setTitle(`📋 AVISOS DE ${user.tag}`)
      .setDescription(desc)
      .setColor('#ff9900')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// 25. AUTOROLE
client.commands.set('autorole', {
  execute: async (interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }
    const role = interaction.options.getRole('cargo');
    if (!client.autoroles) client.autoroles = {};
    client.autoroles[interaction.guild.id] = role.id;
    const embed = new EmbedBuilder()
      .setTitle('✅ AUTOROLE CONFIGURADO')
      .setColor('#00ff00')
      .addFields({ name: 'Cargo', value: role.name, inline: true });
    await interaction.reply({ embeds: [embed] });
  }
});

// 26. AUTOROLE EVENT
client.on('guildMemberAdd', async (member) => {
  if (client.autoroles && client.autoroles[member.guild.id]) {
    try { await member.roles.add(client.autoroles[member.guild.id]); } catch (error) {}
  }
});

// ============ EVENTOS ============

client.on('ready', () => {
  console.log(`🚀 Bot ${client.user.tag} está ONLINE!`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`📋 Comandos: ${client.commands.size}`);
  
  client.user.setPresence({
    activities: [{
      name: `${client.commands.size} comandos | REVOLUTION`,
      type: 3,
      state: 'Use / para ver os comandos'
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