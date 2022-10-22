import { GroupList } from './types';
import { AppError } from './AppError';
import TelegramBot from 'node-telegram-bot-api';
import { readFileSync } from 'fs';

export class Bot {
  private token: string;
  private readonly bot: TelegramBot;
  constructor(token: string) {
    this.token = token;
    this.bot = new TelegramBot(token, { polling: true });
  }

  private loadJson(): GroupList {
    const data = readFileSync('./groups/groups.json');
    return JSON.parse(String(data));
  }

  start() {
    this.bot.setMyCommands([
      { command: '/start', description: 'Начальное привествие' },
    ]);

    this.bot.on('message', async msg => {
      const groups = this.loadJson();
      const chatId = msg.chat.id;
      const text = msg.text || ' ';

      if (text == '/start') {
        await this.bot.sendMessage(
          chatId,
          'Данный бот создан для удобства получения расписания для всех учащихся СГТУ им. Гагарина'
        );
        return await this.bot.sendMessage(
          chatId,
          'Введи свою группу, например, б1-ПИНФ-22'
        );
      }

      if (groups.hasOwnProperty(text)) {
        return this.bot.sendMessage(
          chatId,
          'Я запомнил вашу группу, она ' + text
        );
      }

      if (text) {
        return await this.bot.sendMessage(chatId, 'Некорректные данные');
      }
    });
  }
}
