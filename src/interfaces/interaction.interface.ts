import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Interaction {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => void | Promise<void>;
}
