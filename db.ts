import Dexie, { Table } from "dexie";

export interface Transaction {
  id?: number;
  description: string;
  amount: number;
  date?: Date;
}

export class MyMoneyTrackingDexie extends Dexie {
  transactions!: Table<Transaction>;

  constructor() {
    super("moneyTrackingDB");
    this.version(1).stores({
      transactions: "++id, description, amount, date",
    });
  }
}

export const db = new MyMoneyTrackingDexie();
