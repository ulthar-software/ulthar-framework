import { StorageDriver } from "../storage/storage-driver.js";

export class StateStore {
  constructor(private driver: StorageDriver) {}
}
