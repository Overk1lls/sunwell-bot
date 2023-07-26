import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatInputCommandInteraction, Collection, REST, Routes } from 'discord.js';
import { Interaction } from '../interfaces';

@Injectable()
export class InteractionService implements OnModuleInit {
  private readonly logger = new Logger(InteractionService.name);
  readonly commands = new Collection<string, Interaction>();

  constructor(
    private readonly configService: ConfigService,

  ) {}

  onModuleInit() {
  }

  async executeInteraction(interaction: ChatInputCommandInteraction) {
    const command = this.commands.get(interaction.commandName);

    if (!command) {
      this.logger.error(`No command matching ${interaction.commandName} was found!`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      this.logger.error(error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  }

  addInteraction(interaction: Interaction) {
    return this.commands.set(interaction.data.name, interaction);
  }
}
