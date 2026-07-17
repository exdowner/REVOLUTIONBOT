const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  // Utilidades
  new SlashCommandBuilder().setName('ping').setDescription('🏓 Verificar latência'),
  new SlashCommandBuilder().setName('avatar').setDescription('🖼️ Ver avatar').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('userinfo').setDescription('👤 Info de usuário').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('serverinfo').setDescription('📊 Info do servidor'),
  new SlashCommandBuilder().setName('botinfo').setDescription('🤖 Info do bot'),
  new SlashCommandBuilder().setName('invite').setDescription('📨 Convidar bot'),
  
  // Diversão
  new SlashCommandBuilder().setName('8ball').setDescription('🎱 Pergunte ao 8ball'),
  new SlashCommandBuilder().setName('ship').setDescription('💕 Shippar usuários').addUserOption(o => o.setName('usuario1').setDescription('Usuário 1').setRequired(true)).addUserOption(o => o.setName('usuario2').setDescription('Usuário 2')),
  new SlashCommandBuilder().setName('ratewaifu').setDescription('💯 Avaliar waifu').addUserOption(o => o.setName('usuario').setDescription('Usuário')),
  new SlashCommandBuilder().setName('coinflip').setDescription('🪙 Cara ou coroa'),
  new SlashCommandBuilder().setName('dice').setDescription('🎲 Rolar dado').addIntegerOption(o => o.setName('faces').setDescription('Número de faces').setMinValue(2).setMaxValue(100)),
  new SlashCommandBuilder().setName('rps').setDescription('✊🖐️✌️ Pedra papel tesoura').addStringOption(o => o.setName('escolha').setDescription('Sua escolha').setRequired(true).addChoices({ name: 'Pedra', value: 'pedra' }, { name: 'Papel', value: 'papel' }, { name: 'Tesoura', value: 'tesoura' })),
  new SlashCommandBuilder().setName('say').setDescription('💬 Repetir mensagem').addStringOption(o => o.setName('mensagem').setDescription('Mensagem').setRequired(true)),
  new SlashCommandBuilder().setName('enquete').setDescription('📊 Criar enquete').addStringOption(o => o.setName('pergunta').setDescription('Pergunta').setRequired(true)),
  
  // Moderação
  new SlashCommandBuilder().setName('clear').setDescription('🧹 Apagar mensagens').addIntegerOption(o => o.setName('quantidade').setDescription('Número (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
  new SlashCommandBuilder().setName('slowmode').setDescription('🐢 Ativar slowmode').addIntegerOption(o => o.setName('segundos').setDescription('Segundos').setRequired(true)),
  new SlashCommandBuilder().setName('lock').setDescription('🔒 Bloquear canal'),
  new SlashCommandBuilder().setName('unlock').setDescription('🔓 Desbloquear canal'),
  new SlashCommandBuilder().setName('kick').setDescription('👢 Expulsar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('ban').setDescription('🔨 Banir membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('mute').setDescription('🔇 Silenciar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addIntegerOption(o => o.setName('tempo').setDescription('Minutos').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('unmute').setDescription('🔊 Desmutar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('⚠️ Avisar membro').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)).addStringOption(o => o.setName('motivo').setDescription('Motivo')),
  new SlashCommandBuilder().setName('warnlist').setDescription('📋 Ver avisos').addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true)),
  new SlashCommandBuilder().setName('autorole').setDescription('⚙️ Configurar cargo automático').addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true))
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🚀 REGISTRANDO COMANDOS...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log(`✅ ${commands.length} COMANDOS REGISTRADOS!`);
    console.log('📱 Comandos disponíveis!');
  } catch (error) {
    console.error('❌ ERRO:', error);
  }
})();