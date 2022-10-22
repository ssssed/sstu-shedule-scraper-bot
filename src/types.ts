export type Day = {
  room?: string;
  name?: string;
  type?: string;
  time?: string;
  teacher?: string;
  message?: string;
};

export type Week = {
  day: string;
  week: string;
  lessons: Day[];
};

export interface Scraper {
  link: string;
  getRasp(): Promise<Week[]>;
}

export interface GroupList {
  [key: string]: string;
}
