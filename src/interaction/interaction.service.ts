import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatInputCommandInteraction, Collection, REST, Routes } from 'discord.js';
import { requestItemCommand } from './commands';
import { Interaction } from '../interfaces';
import { RequestItem } from '../schemas';

@Injectable()
export class InteractionService implements OnModuleInit {
  private readonly logger = new Logger(InteractionService.name);
  readonly commands = new Collection<string, Interaction>();

  constructor(
    private readonly configService: ConfigService,

    @InjectModel(RequestItem.name) private readonly itemRequestModel: Model<RequestItem>,
  ) {}

  onModuleInit() {
    const interaction: Interaction = {
      data: requestItemCommand,
      execute: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({ ephemeral: true });

        const [{ value: nickname }, { value: classSpec }, { value: item }] =
          interaction.options.data;

        const createdItemRequest = new this.itemRequestModel({ nickname, classSpec, item });
        await createdItemRequest.save();

        await interaction.editReply('Данные были сохранены!');
      },
    };

    this.commands.set(interaction.data.name, interaction);
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

  private async registerInteractions() {
    const token = this.configService.getOrThrow<string>('DISCORD_BOT_TOKEN');
    const clientId = this.configService.getOrThrow<string>('DISCORD_CLIENT_ID');
    const guildId = this.configService.getOrThrow<string>('DISCORD_GUILD_ID');

    const rest = new REST().setToken(token);

    try {
      this.logger.log(`Started refreshing ${this.commands.size} application (/) commands.`);

      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: [...this.commands.values()].map((c) => c.data.toJSON()),
      });

      this.logger.log(`Successfully reloaded ${this.commands.size} application (/) commands.`);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
