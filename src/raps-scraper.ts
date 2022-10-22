import { AppError } from './AppError';
import axios, { AxiosError } from 'axios';
import { JSDOM } from 'jsdom';
import { Day, Scraper, Week } from './types';

export class Rasp_Scraper implements Scraper {
  link: string;
  readonly timeLesson = [
    '8:00-9:30',
    '9:45-11:15',
    '11:30-13:00',
    '13:40-15:10',
    '15:20-16:50',
    '17:00 - 18:30',
    '18:40 - 20:10',
    '20:20 - 21:50',
  ] as const;
  week_rasp: Week[] = [];
  constructor(link: string) {
    this.link = link;
  }

  private initDomTree(html: string) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    return document;
  }

  private isEmptyLesson(lesson: Element): boolean {
    if (lesson.classList.contains('day-lesson-empty')) return true;
    return false;
  }

  async getRasp() {
    try {
      const response = await axios.get(this.link);
      const document = this.initDomTree(response.data);
      const days = document.querySelectorAll('.day');
      days.forEach(day => {
        const day_rasp: Day[] = [];
        const day_header = day.querySelector('.day-header');
        const week = day_header?.querySelector('span')?.textContent || '';
        const day_name = day_header?.textContent?.replace(week, '');
        const lessons = day.querySelectorAll('.day-lesson');
        let lesson_time_id = 0;
        lessons.forEach(lesson => {
          if (this.isEmptyLesson(lesson)) {
            day_rasp.push({
              room: '',
              name: '-',
              type: '',
              teacher: '',
            });
            lesson_time_id++;
          }
          const lesson_room =
            lesson.querySelector('.lesson-room')?.textContent || '';
          const lesson_name =
            lesson.querySelector('.lesson-name')?.textContent || '';
          const lesson_type =
            lesson.querySelector('.lesson-type')?.textContent || '';
          const lesson_teacher =
            lesson.querySelector('.lesson-teacher')?.textContent || 'Не Указан';
          day_rasp.push({
            room: lesson_room,
            name: lesson_name,
            type: lesson_type,
            time: this.timeLesson[lesson_time_id],
            teacher: lesson_teacher,
          });
          lesson_time_id++;
        });
        if (!day_rasp.length) day_rasp.push({ message: 'Нет пар' });
        if (day_name)
          this.week_rasp.push({
            day: day_name,
            week,
            lessons: day_rasp,
          });
      });
    } catch (error) {
      if (axios.isAxiosError(error)) AppError.apiError(String(error));
      else AppError.codeError(String(error));
    } finally {
      return new Promise<Week[]>(resolve => resolve(this.week_rasp));
    }
  }
}
