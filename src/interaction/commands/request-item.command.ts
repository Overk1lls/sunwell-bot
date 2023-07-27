import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export const requestItemCommand = new SlashCommandBuilder()
  .setName('request-item')
  .setDescription('Запросить какую-нибудь шмотку из босса')
  .addStringOption((option) =>
    // eslint-disable-next-line
    option
      .setName('nickname')
      .setDescription('Никнейм игрока')
      .setRequired(true)
      .setMaxLength(15),
  )
  .addStringOption((option) =>
    option
      .setName('class-spec')
      .setDescription('Класс и спек игрока')
      .setRequired(true)
      .setMaxLength(20),
  )
  .addStringOption((option) =>
    option
      .setName('item')
      .setDescription('Шмотка которая вас интересует')
      .setRequired(true)
      .setMaxLength(20),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
  .setDMPermission(false);
