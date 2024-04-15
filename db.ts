import Dexie, { Table } from "dexie";

export interface Category {
  id?: number;
  name: string;
  type?: string;
}

export interface Record {
  id?: number;
  name: string;
  note?: string;
  amount: number;
  category_id: number;
  category_type?: string;
  date?: string;
}

export class MyMoneyTrackingDexie extends Dexie {
  records!: Table<Record>;
  categories!: Table<Category>;

  constructor() {
    super("moneyTrackingDB");
    this.version(1).stores({
      records: "++id, name, note, amount, category_id, date",
      categories: "++id, &name, type",
    });
  }
}

export const db = new MyMoneyTrackingDexie();
