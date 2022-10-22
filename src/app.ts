import { Rasp_Scraper } from './raps-scraper';
import { GroupScraper } from './group-scraper';
class App {
  private shedule_scraper: Rasp_Scraper = new Rasp_Scraper(
    'https://rasp.sstu.ru/rasp/group/22'
  );
  private group_scraper: GroupScraper = new GroupScraper();

  async getShedule() {
    const shedule = await this.shedule_scraper.getRasp();
    console.log(shedule);
  }

  async generateGroupList() {
    await this.group_scraper.main();
  }
}

const app: App = new App();
app.generateGroupList();
