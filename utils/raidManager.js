class RaidManager {
  constructor() {
    this.activeAttacks = new Map();
  }

  startRaid(guild, target, reason, client) {
    const guildId = guild.id;
    
    if (this.activeAttacks.has(guildId)) {
      this.stopRaid(guildId);
    }

    const channels = guild.channels.cache.filter(ch => 
      ch.isTextBased() && 
      ch.permissionsFor(client.user).has('SendMessages')
    );

    let channelList = Array.from(channels.values());
    let index = 0;
    let messageCount = 0;
    
    const interval = setInterval(async () => {
      try {
        const channel = channelList[index % channelList.length];
        index++;
        messageCount++;

        if (channel) {
          await channel.send(`🔥 RAID BY REVOLUTION - ${target}`);
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

    this.activeAttacks.set(guildId, {
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
    
    return this.activeAttacks.get(guildId);
  }

  stopRaid(guildId) {
    const raid = this.activeAttacks.get(guildId);
    if (raid) {
      clearInterval(raid.interval);
      this.activeAttacks.delete(guildId);
      console.log(`🛑 RAID parado no servidor ${guildId}`);
      
      if (this.activeAttacks.size === 0) {
        this.isRunning = false;
      }
      return true;
    }
    return false;
  }

  stopAllRaids() {
    let count = 0;
    for (const [guildId, raid] of this.activeAttacks) {
      clearInterval(raid.interval);
      count++;
    }
    this.activeAttacks.clear();
    this.isRunning = false;
    console.log(`🛑 Todas as RAIDs paradas (${count})`);
    return count;
  }

  getStatus(guildId) {
    return this.activeAttacks.get(guildId) || null;
  }

  listRaids() {
    const list = [];
    for (const [guildId, raid] of this.activeAttacks) {
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
