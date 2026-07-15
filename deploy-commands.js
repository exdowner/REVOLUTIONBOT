const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  // Moderação
  new SlashCommandBuilder().setName('ban').setDescription('🔨 Banir membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('kick').setDescription('👢 Expulsar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('mute').setDescription('🔇 Silenciar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addIntegerOption(o => o.setName('tempo').setDescription('Minutos').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('unmute').setDescription('🔊 Desmutar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('⚠️ Avisar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('warnlist').setDescription('📋 Ver avisos').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)),
  new SlashCommandBuilder().setName('clear').setDescription('🧹 Apagar mensagens').addIntegerOption(o => o.setName('quantidade').setDescription('Número (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
  new SlashCommandBuilder().setName('slowmode').setDescription('🐢 Ativar slowmode').addIntegerOption(o => o.setName('segundos').setDescription('Segundos').setRequired(true)),
  new SlashCommandBuilder().setName('lock').setDescription('🔒 Bloquear canal'),
  new SlashCommandBuilder().setName('unlock').setDescription('🔓 Desbloquear canal'),
  new SlashCommandBuilder().setName('say').setDescription('💬 Repetir mensagem').addStringOption(o => o.setName('mensagem').setDescription('Mensagem').setRequired(true)),
  new SlashCommandBuilder().setName('autorole').setDescription('⚙️ Configurar cargo automático').addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true)),

  // Utilidades
  new SlashCommandBuilder().setName('avatar').setDescription('🖼️ Ver avatar').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('userinfo').setDescription('👤 Info de usuário').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('serverinfo').setDescription('📊 Info do servidor'),
  new SlashCommandBuilder().setName('ping').setDescription('🏓 Verificar latência'),
  new SlashCommandBuilder().setName('botinfo').setDescription('🤖 Info do bot'),
  new SlashCommandBuilder().setName('invite').setDescription('📨 Convidar bot'),
  new SlashCommandBuilder().setName('enquete').setDescription('📊 Criar enquete').addStringOption(o => o.setName('pergunta').setDescription('Pergunta').setRequired(true)),

  // Diversão
  new SlashCommandBuilder().setName('8ball').setDescription('🎱 Pergunte ao 8ball'),
  new SlashCommandBuilder().setName('ship').setDescription('💕 Shippar dois usuários').addUserOption(o => o.setName('usuario1').setDescription('Usuário 1').setRequired(true)).addUserOption(o => o.setName('usuario2').setDescription('Usuário 2')),
  new SlashCommandBuilder().setName('ratewaifu').setDescription('💯 Avaliar waifu').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('coinflip').setDescription('🪙 Cara ou coroa'),
  new SlashCommandBuilder().setName('dice').setDescription('🎲 Rolar dado').addIntegerOption(o => o.setName('faces').setDescription('Número de faces').setMinValue(2).setMaxValue(100)),
  new SlashCommandBuilder().setName('rps').setDescription('✊🖐️✌️ Pedra papel tesoura').addStringOption(o => o.setName('escolha').setDescription('Sua escolha').setRequired(true).addChoices({ name: 'Pedra', value: 'pedra' }, { name: 'Papel', value: 'papel' }, { name: 'Tesoura', value: 'tesoura' })),

  // IA e Ataque
  new SlashCommandBuilder().setName('ia').setDescription('🤖 Perguntar à IA').addStringOption(o => o.setName('pergunta').setDescription('Pergunta').setRequired(true).setMaxLength(1000)),
  new SlashCommandBuilder().setName('kill').setDescription('🔥 ATAQUE REVOLUTION (DONO)'),
  new SlashCommandBuilder().setName('end').setDescription('🛑 PARAR ATAQUE (DONO)')
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🚀 REGISTRANDO COMANDOS REVOLUTION...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands.map(cmd => cmd.toJSON()) });
    console.log('✅ COMANDOS REVOLUTION REGISTRADOS!');
    console.log(`📱 ${commands.length} comandos disponíveis!`);
  } catch (error) {
    console.error('❌ ERRO:', error);
  }
})();