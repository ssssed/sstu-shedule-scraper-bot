import { GroupList } from './types';
import { Rasp_Scraper } from './raps-scraper';
import { AppError } from './AppError';
import { existsSync, readFile, writeFileSync, mkdir } from 'fs';

export class Shedule {
  private path = './groups';
  async generateRaspFiles() {
    if (existsSync(this.path)) {
      readFile(`${this.path}/groups.json`, async (err, data) => {
        if (err) throw AppError.folderNotFound(String(err));
        const groups: GroupList = JSON.parse(String(data));
        await this.createFiles(groups);
      });
    }
  }

  private async createFiles(groups: GroupList) {
    for (const group in groups) {
      const rasp_scraper = new Rasp_Scraper(groups[group]);
      const file_name = `${this.path}/rasp/${group}.json`;
      const rasp_week = await rasp_scraper.getRasp();
      if (existsSync(`${this.path}/rasp`)) {
        writeFileSync(file_name, JSON.stringify(rasp_week));
      } else {
        mkdir(`${this.path}/rasp`, error => {
          if (error) throw AppError.createFolderError(String(error));
        });
        writeFileSync(file_name, JSON.stringify(rasp_week));
      }
    }
  }
}
