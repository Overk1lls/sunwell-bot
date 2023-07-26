import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Collection, Events, GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
@Injectable()
export class AppService implements OnModuleInit {
  private discordClient: Client;
  private readonly commands = new Collection<string, Interaction>();
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly configService: ConfigService,
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

    await this.discordClient.login(token);

    this.discordClient.on(Events.ClientReady, () =>
      this.logger.log(`${this.discordClient.user.username} has been bootstrapped!`),
    );
  }

