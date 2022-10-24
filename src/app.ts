import { Bot } from './bot';
import { Schedule } from './schedule';
import { Rasp_Scraper } from './raps-scraper';
import { GroupScraper } from './group-scraper';
import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from './db/db';
import { AppError } from './AppError';
import { User } from './model/model';

class App {
  private readonly schedule_scraper: Rasp_Scraper = new Rasp_Scraper(
    'https://rasp.sstu.ru/rasp/group/22'
  );
  private readonly group_scraper: GroupScraper = new GroupScraper();
  private readonly schedule = new Schedule();
  private readonly token = process.env.TOKEN || '';
  private readonly bot: Bot = new Bot(this.token);
  async getSchedule() {
    const schedule = await this.schedule_scraper.getRasp();
  }

  async generateGroupList() {
    await this.group_scraper.main();
  }

  getAllRasp() {
    this.schedule.generateRaspFiles();
  }

  async start() {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      this.bot.start();
    } catch (e) {
      throw AppError.bdConnectionError(String(e));
    }
    // await this.generateGroupList();
    // this.getAllRasp();
  }
}

const app: App = new App();
app.start();
