import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export const requestPlayersCommand = new SlashCommandBuilder()
  .setName('request-players')
  .setDescription('Запросить информацию о том кто желает купить вещи')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setDMPermission(false);
