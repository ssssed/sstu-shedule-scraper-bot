import { AppError } from './AppError';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { GroupList } from './types';
import { writeFile, existsSync, mkdir } from 'fs';

export class GroupScraper {
  private link: string = 'https://rasp.sstu.ru/' as const;
  private group_list: GroupList = {};
  private file_name: string = './groups/groups.json';

  private initDomTree(html: string) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    return document;
  }

  async scrapGroup() {
    const response = await axios.get(this.link);
    const document = this.initDomTree(response.data);
    const groups = document.querySelectorAll('.group');
    if (groups) {
      for (const group of groups) {
        const full_link =
          this.link.slice(0, this.link.length - 1) +
          group.querySelector('a')?.href;
        const group_name = group.textContent || 'group';
        this.group_list[group_name] = full_link;
      }
    }
  }

  private writeSheduleJSONFile() {
    writeFile(this.file_name, JSON.stringify(this.group_list), err => {
      if (err) throw AppError.writeFileError(String(err));
    });
  }

  private createGroupList() {
    if (existsSync('./groups')) {
      this.writeSheduleJSONFile();
    } else {
      mkdir('./groups', err => {
        if (err) throw AppError.createFolderError(String(err));
      });
      this.writeSheduleJSONFile();
    }
  }

  async main() {
    await this.scrapGroup();
    this.createGroupList();
  }
}
