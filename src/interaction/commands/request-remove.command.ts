import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export const requestRemoveItem = new SlashCommandBuilder()
  .setName('remove-request')
  .setDescription('Отменить запрос на покупку вещи')
  .addStringOption((option) =>
    option
      .setName('id')
      .setDescription('Идентификатор записи (указывается в скобочках при получении списка)')
      .setMinLength(20)
      .setMaxLength(30),
  )
  .addStringOption((option) =>
    option
      .setName('nickname')
      .setDescription('Никнейм игрока (введите что-то одно из двух: имя игрока или его айди))')
      .setMinLength(2)
      .setMaxLength(15),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setDMPermission(false);
