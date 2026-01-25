import Dexie from 'dexie';

export const db = new Dexie('CarniceriaDB');

db.version(1).stores({
  products: 'id, name, category, price, piece', // Primary key and indexed props
  salesQueue: '++id, timestamp, data, status' // Queue for offline sales
});
