class RaidManager {
  constructor() {
    this.activeRaids = new Map();
    this.isRunning = false;
  }

  startRaid(guild, target, reason, client) {
    const guildId = guild.id;
    
    if (this.activeRaids.has(guildId)) {
      this.stopRaid(guildId);
    }

    const channels = guild.channels.cache.filter(ch => 
      ch.isTextBased() && 
      ch.permissionsFor(client.user).has('SendMessages')
    );

    let channelList = Array.from(channels.values());
    
    const raidMessage = `
🚨 **ALERTA DE RAID** 🚨
━━━━━━━━━━━━━━━━━━━━━━
🔥 **RAID BY REVOLUTION** 🔥

🎯 **ALVO:** ${target}
📋 **MOTIVO:** ${reason}
🛡️ **COMANDANTE:** ${client.user.tag}

⚡ **TODOS OS ADMINISTRADORES, ATENÇÃO!**
📢 **PREPARAR PARA AÇÃO!**

💀 **ESTE SERVIDOR ESTÁ SOB OPERAÇÃO REVOLUTION**
━━━━━━━━━━━━━━━━━━━━━━
`;

    let index = 0;
    let messageCount = 0;
    
    const interval = setInterval(async () => {
      try {
        const channel = channelList[index % channelList.length];
        index++;
        messageCount++;

        if (channel) {
          await channel.send(raidMessage);
          console.log(`📢 RAID enviado para ${channel.name} (${messageCount})`);
        }

        if (index >= channelList.length) {
          index = 0;
        }

        if (messageCount >= 100) {
          console.log('🛑 Limite de 100 mensagens atingido! Parando RAID...');
          this.stopRaid(guildId);
        }

      } catch (error) {
        console.error(`Erro no RAID: ${error.message}`);
      }
    }, 5000);

    this.activeRaids.set(guildId, {
      interval,
      channels: channelList,
      message: raidMessage,
      target,
      reason,
      startTime: new Date(),
      messageCount: 0
    });

    this.isRunning = true;
    console.log(`🔥 RAID iniciado no servidor ${guild.name} contra ${target}`);
    
    return this.activeRaids.get(guildId);
  }

  stopRaid(guildId) {
    const raid = this.activeRaids.get(guildId);
    if (raid) {
      clearInterval(raid.interval);
      this.activeRaids.delete(guildId);
      console.log(`🛑 RAID parado no servidor ${guildId}`);
      
      if (this.activeRaids.size === 0) {
        this.isRunning = false;
      }
      return true;
    }
    return false;
  }

  stopAllRaids() {
    let count = 0;
    for (const [guildId, raid] of this.activeRaids) {
      clearInterval(raid.interval);
      count++;
    }
    this.activeRaids.clear();
    this.isRunning = false;
    console.log(`🛑 Todas as RAIDs paradas (${count})`);
    return count;
  }

  getStatus(guildId) {
    return this.activeRaids.get(guildId) || null;
  }

  listRaids() {
    const list = [];
    for (const [guildId, raid] of this.activeRaids) {
      list.push({
        guildId,
        target: raid.target,
        reason: raid.reason,
        startTime: raid.startTime,
        messageCount: raid.messageCount
      });
    }
    return list;
  }
}

module.exports = RaidManager;