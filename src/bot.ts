import { Schedule } from './schedule';
import { User } from './model/model';
import { GroupList, Week } from './types';
import { AppError } from './AppError';
import TelegramBot from 'node-telegram-bot-api';
import { readFileSync } from 'fs';
import path from 'path';
export class Bot {
  private readonly bot: TelegramBot;
  private auth = false;
  private schedule: Schedule = new Schedule();
  private keyboard = {
    reply_markup: {
      keyboard: [
        [
          { text: 'Получить расписание на сегодня' },
          { text: 'На неделю' },
          { text: 'На две недели' },
        ],
      ],
    },
  };
  private user_group: string = '';
  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
  }

  private formatDate(date: string): string {
    if (date.length === 1) return '0' + date;
    return date;
  }

  today(date: Date, next = 0) {
    const day: string =
      this.formatDate(String(date.getDate() + next)) +
      '.' +
      this.formatDate(String(date.getMonth() + 1));
    console.log(`[ DATE ] ${day}`);
    return day;
  }

  private loadJson(): GroupList {
    const data = readFileSync('./groups/groups.json');
    return JSON.parse(String(data));
  }

  private makeLessonMessage(today: Week) {
    let msg = `${today.day} | ${today.week}\n-----------------------\n`;
    today.lessons.forEach((lesson, index) => {
      if (
        lesson.message == 'Нет Пар' ||
        lesson.name == '' ||
        lesson.name == '-'
      ) {
        msg += `\n${index + 1}. Выходной\n`;
      } else {
        msg += `
        \n${index + 1}. ${lesson.name} ${lesson.type}\n
        Кабинет: ${lesson.room}\n
        Время: ${lesson.time}\n
        Преподаватель: ${lesson.teacher || 'Не указан'}
        \n`;
      }
    });
    return msg;
  }

  start() {
    console.log('[ BOT ] started');
    const date = this.today(new Date());
    this.bot.setMyCommands([
      { command: '/start', description: 'Начальное привествие' },
      { command: '/setting', description: 'Изменить группу' },
    ]);

    this.bot.on('message', async msg => {
      const groups = this.loadJson();
      const chatId = msg.chat.id;
      const text = msg.text || ' ';

      const user = await User.findOne({ where: { chatId } });
      if (user) this.auth = true;
      if (text === '/start') {
        await this.bot.sendMessage(
          chatId,
          'Данный бот создан для удобства получения расписания для всех учащихся СГТУ им. Гагарина'
        );
        if (this.auth) {
          return this.bot.sendMessage(chatId, '', this.keyboard);
        }
        return await this.bot.sendMessage(
          chatId,
          'Введи свою группу, например, б1-ПИНФ-22'
        );
      }

      if (text === '/setting') {
        return await this.bot.sendMessage(
          chatId,
          'Напиши группу в который вы учитесь'
        );
      }

      if (groups.hasOwnProperty(text)) {
        if (!user) {
          const new_user = await User.create({
            chatId,
            group: text,
          });
          this.auth = true;
          this.user_group = text;
          return this.bot.sendMessage(
            chatId,
            'Я запомнил вашу группу',
            this.keyboard
          );
        } else {
          const update_user = await user.update({
            group: text,
          });
          if (update_user) {
            return this.bot.sendMessage(
              chatId,
              'Я запомнил вашу группу',
              this.keyboard
            );
          }
        }
        return this.bot.sendMessage(chatId, 'Произошла ошибка');
      }

      if (text === 'Получить расписание на сегодня') {
        const user = await User.findOne({ where: { chatId } });
        this.user_group = user?.getDataValue('group');
        const rasp: Week[] = JSON.parse(
          String(
            readFileSync(
              path.resolve(
                __dirname,
                '..',
                'groups',
                'rasp',
                `${this.user_group}.json`
              )
            )
          )
        );
        const day = rasp.find(d => d.day == date);
        if (day) {
          return this.bot.sendMessage(
            chatId,
            this.makeLessonMessage(day),
            this.keyboard
          );
        } else {
          await this.bot.sendMessage(
            chatId,
            'Простите, бот временно не доступен, попробуйте через несколько минут',
            this.keyboard
          );
          this.schedule.generateRaspFiles();
          return;
        }
      }

      if (text) {
        return await this.bot.sendMessage(chatId, 'Некорректные данные');
      }
    });
  }
}
