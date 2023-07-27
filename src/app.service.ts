import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InteractionService } from './interaction/interaction.service';

@Injectable()
export class AppService implements OnModuleInit {
  private discordClient: Client;
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly interactionService: InteractionService,
  ) {}

  async onModuleInit() {
    this.discordClient = new Client({
      partials: [Partials.User, Partials.GuildMember, Partials.Message],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      presence: {
        status: 'online',
      },
    });

    this.initBot();
  }

  async initBot() {
    const token = this.configService.getOrThrow<string>('DISCORD_BOT_TOKEN');
    const interactionsChannelId = this.configService.getOrThrow<string>('DISCORD_GUILD_CHANNEL_ID');

    await this.discordClient.login(token);

    this.discordClient.on(Events.ClientReady, () =>
      this.logger.log(`${this.discordClient.user.username} has been bootstrapped!`),
    );

    this.discordClient.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand() || interaction.member.user.bot) return;

      if (interaction.channelId !== interactionsChannelId) {
        await interaction.reply({ content: 'Я не отвечаю в этом канале', ephemeral: true });
      } else {
        await this.interactionService.executeInteraction(interaction);
      }
    });
  }
}
