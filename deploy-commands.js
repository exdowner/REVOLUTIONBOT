const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  // ORIGINAIS (26)
  new SlashCommandBuilder().setName('ping').setDescription('🏓 Verificar latência'),
  new SlashCommandBuilder().setName('avatar').setDescription('🖼️ Ver avatar').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('userinfo').setDescription('👤 Info de usuário').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('serverinfo').setDescription('📊 Info do servidor'),
  new SlashCommandBuilder().setName('botinfo').setDescription('🤖 Info do bot'),
  new SlashCommandBuilder().setName('8ball').setDescription('🎱 Pergunte ao 8ball'),
  new SlashCommandBuilder().setName('ship').setDescription('💕 Shippar usuários').addUserOption(o => o.setName('usuario1').setDescription('Usuário 1').setRequired(true)).addUserOption(o => o.setName('usuario2').setDescription('Usuário 2')),
  new SlashCommandBuilder().setName('ratewaifu').setDescription('💯 Avaliar waifu').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('coinflip').setDescription('🪙 Cara ou coroa'),
  new SlashCommandBuilder().setName('dice').setDescription('🎲 Rolar dado').addIntegerOption(o => o.setName('faces').setDescription('Faces').setMinValue(2).setMaxValue(100)),
  new SlashCommandBuilder().setName('rps').setDescription('✊🖐️✌️ Pedra papel tesoura').addStringOption(o => o.setName('escolha').setDescription('Escolha').setRequired(true).addChoices({ name: 'Pedra', value: 'pedra' }, { name: 'Papel', value: 'papel' }, { name: 'Tesoura', value: 'tesoura' })),
  new SlashCommandBuilder().setName('say').setDescription('💬 Repetir mensagem').addStringOption(o => o.setName('mensagem').setDescription('Mensagem').setRequired(true)),
  new SlashCommandBuilder().setName('enquete').setDescription('📊 Criar enquete').addStringOption(o => o.setName('pergunta').setDescription('Pergunta').setRequired(true)),
  new SlashCommandBuilder().setName('invite').setDescription('📨 Convidar bot'),
  new SlashCommandBuilder().setName('clear').setDescription('🧹 Apagar mensagens').addIntegerOption(o => o.setName('quantidade').setDescription('Número').setRequired(true).setMinValue(1).setMaxValue(100)),
  new SlashCommandBuilder().setName('slowmode').setDescription('🐢 Ativar slowmode').addIntegerOption(o => o.setName('segundos').setDescription('Segundos').setRequired(true)),
  new SlashCommandBuilder().setName('lock').setDescription('🔒 Bloquear canal'),
  new SlashCommandBuilder().setName('unlock').setDescription('🔓 Desbloquear canal'),
  new SlashCommandBuilder().setName('kick').setDescription('👢 Expulsar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('ban').setDescription('🔨 Banir membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('mute').setDescription('🔇 Silenciar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addIntegerOption(o => o.setName('tempo').setDescription('Minutos').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('unmute').setDescription('🔊 Desmutar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('⚠️ Avisar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('warnlist').setDescription('📋 Ver avisos').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)),
  new SlashCommandBuilder().setName('autorole').setDescription('⚙️ Configurar cargo automático').addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true)),
  
  // NOVOS (30)
  new SlashCommandBuilder().setName('uptime').setDescription('⏱️ Tempo online do bot'),
  new SlashCommandBuilder().setName('members').setDescription('👥 Contar membros do servidor'),
  new SlashCommandBuilder().setName('roles').setDescription('🎭 Listar cargos do servidor'),
  new SlashCommandBuilder().setName('emoji').setDescription('😀 Listar emojis do servidor'),
  new SlashCommandBuilder().setName('boost').setDescription('💎 Info dos boosts do servidor'),
  new SlashCommandBuilder().setName('roleinfo').setDescription('🎭 Info de um cargo').addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true)),
  new SlashCommandBuilder().setName('channelinfo').setDescription('📢 Info de um canal').addChannelOption(o => o.setName('canal').setDescription('Canal')),
  new SlashCommandBuilder().setName('afk').setDescription('🛌 Marcar como AFK').addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('reminder').setDescription('⏰ Criar lembrete').addIntegerOption(o => o.setName('minutos').setDescription('Minutos').setRequired(true)).addStringOption(o => o.setName('texto').setDescription('Texto').setRequired(true)),
  new SlashCommandBuilder().setName('poll').setDescription('📊 Enquete com reações').addStringOption(o => o.setName('pergunta').setDescription('Pergunta').setRequired(true)),
  new SlashCommandBuilder().setName('suggest').setDescription('💡 Enviar sugestão').addStringOption(o => o.setName('sugestao').setDescription('Sugestão').setRequired(true)),
  new SlashCommandBuilder().setName('report').setDescription('🚨 Reportar usuário').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(true)),
  new SlashCommandBuilder().setName('random').setDescription('🎲 Número aleatório').addIntegerOption(o => o.setName('min').setDescription('Mínimo')).addIntegerOption(o => o.setName('max').setDescription('Máximo')),
  new SlashCommandBuilder().setName('choice').setDescription('🤔 Escolher entre opções').addStringOption(o => o.setName('opcoes').setDescription('Opções separadas por vírgula').setRequired(true)),
  new SlashCommandBuilder().setName('math').setDescription('🧮 Calculadora').addStringOption(o => o.setName('expressao').setDescription('Expressão').setRequired(true)),
  new SlashCommandBuilder().setName('timestamp').setDescription('🕐 Timestamp atual'),
  new SlashCommandBuilder().setName('qrcode').setDescription('📱 Gerar QR Code').addStringOption(o => o.setName('texto').setDescription('Texto').setRequired(true)),
  new SlashCommandBuilder().setName('translate').setDescription('🌐 Traduzir texto (simulação)').addStringOption(o => o.setName('texto').setDescription('Texto').setRequired(true)),
  new SlashCommandBuilder().setName('weather').setDescription('🌤️ Clima (simulação)').addStringOption(o => o.setName('cidade').setDescription('Cidade').setRequired(true)),
  new SlashCommandBuilder().setName('urban').setDescription('📚 Significado (simulação)').addStringOption(o => o.setName('palavra').setDescription('Palavra').setRequired(true)),
  new SlashCommandBuilder().setName('whois').setDescription('🔍 Quem é').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('guildicon').setDescription('🖼️ Ícone do servidor'),
  new SlashCommandBuilder().setName('banner').setDescription('🎨 Banner de usuário').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('nick').setDescription('✏️ Alterar nickname').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('nickname').setDescription('Novo nick').setRequired(true)),
  new SlashCommandBuilder().setName('voice').setDescription('🔊 Info do canal de voz'),
  new SlashCommandBuilder().setName('dm').setDescription('📩 Enviar DM (dono)').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('mensagem').setDescription('Mensagem').setRequired(true)),
  new SlashCommandBuilder().setName('announce').setDescription('📢 Anúncio (admin)').addStringOption(o => o.setName('mensagem').setDescription('Mensagem').setRequired(true)),
  new SlashCommandBuilder().setName('giveaway').setDescription('🎉 Sorteio (admin)').addStringOption(o => o.setName('premio').setDescription('Prêmio').setRequired(true)).addIntegerOption(o => o.setName('minutos').setDescription('Minutos').setRequired(true)),
  new SlashCommandBuilder().setName('xp').setDescription('📊 Ver XP de usuário').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('leaderboard').setDescription('🏆 Ranking de XP'),
  
  // IA
  new SlashCommandBuilder().setName('ia').setDescription('🤖 Perguntar à IA Revolution').addStringOption(o => o.setName('pergunta').setDescription('Sua pergunta').setRequired(true).setMaxLength(1000))
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🚀 REGISTRANDO 57 COMANDOS...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands.map(cmd => cmd.toJSON()) });
    console.log(`✅ ${commands.length} COMANDOS REGISTRADOS!`);
  } catch (error) {
    console.error('❌ ERRO:', error);
  }
})();