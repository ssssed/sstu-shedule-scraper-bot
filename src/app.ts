import { Schedule } from './schedule';
import { Rasp_Scraper } from './raps-scraper';
import { GroupScraper } from './group-scraper';
class App {
  private readonly schedule_scraper: Rasp_Scraper = new Rasp_Scraper(
    'https://rasp.sstu.ru/rasp/group/22'
  );
  private readonly group_scraper: GroupScraper = new GroupScraper();
  private readonly shedule = new Schedule();
  async getSchedule() {
    const schedule = await this.schedule_scraper.getRasp();
    console.log(schedule);
  }

  async generateGroupList() {
    await this.group_scraper.main();
  }

  getAllRasp() {
    this.shedule.generateRaspFiles();
  }

  async start() {
    await this.generateGroupList();
    this.getAllRasp();
  }
}

const app: App = new App();
app.start();
