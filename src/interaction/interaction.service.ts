import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ChatInputCommandInteraction, Collection, REST, Routes } from 'discord.js';
import { requestItemCommand, requestPlayersCommand, requestRemoveItem } from './commands';
import { capitalizeWord } from './interaction.utils';
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
    const interactions: Interaction[] = [
      {
        data: requestItemCommand,
        execute: async (interaction: ChatInputCommandInteraction) => {
          await interaction.deferReply({ ephemeral: true });

          const [{ value: nickname }, { value: classSpec }, { value: item }] =
            interaction.options.data;

          const createdItemRequest = new this.itemRequestModel({
            classSpec,
            item,
            nickname: nickname.toString().toLowerCase(),
          });
          await createdItemRequest.save();

          await interaction.editReply(`Данные были сохранены: ${nickname} - ${classSpec} - ${item}`);
        },
      },
      {
        data: requestPlayersCommand,
        execute: async (interaction) => {
          await interaction.deferReply({ ephemeral: true });

          const requestedItems = await this.itemRequestModel.find();

          if (!requestedItems.length) {
            await interaction.editReply('На данный момент никто ещё не запросил вещь');
            return;
          }

          let response = 'На данный момент:\n';

          for (let i = 0; i < requestedItems.length; i++) {
            const { _id, nickname, classSpec, item } = requestedItems[i];

            const capitalizedNick = capitalizeWord(nickname);

            response = response.concat(
              `${i + 1}. ${capitalizedNick} - ${classSpec} - ${item} (\`${_id}\`)\n`,
            );
          }

          await interaction.editReply(response);
        },
      },
      {
        data: requestRemoveItem,
        execute: async (interaction) => {
          await interaction.deferReply({ ephemeral: true });

          const [optionOne, optionTwo] = interaction.options.data;

          if (!optionOne && !optionTwo) {
            await interaction.editReply('Для удаления нужен айди или имя игрока!');
            return;
          }

          const { name, value } = optionOne;
          const queryCriteria: FilterQuery<RequestItem> =
            name === 'id'
              ? { _id: new Types.ObjectId(value.toString()) }
              : { nickname: value.toString().toLowerCase() };

          const result = await this.itemRequestModel.findOneAndDelete(queryCriteria);

          await interaction.editReply(
            result
              ? `Запись ${capitalizeWord(result.nickname)} была удалена`
              : `Записи с таким параметром "${value}" не существует`,
          );
        },
      },
    ];

    for (const interaction of interactions) {
      this.commands.set(interaction.data.name, interaction);
    }
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
