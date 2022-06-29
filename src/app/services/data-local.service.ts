import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Registro } from '../models/registro.model';

const BARCODE_GUARDADOS = 'guardados';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = [];
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    await this._storage.get(BARCODE_GUARDADOS).then( registros => {
      this.guardados = registros || [];
    });
  
  }

  async guardarRegistro(format: string, text: string) {

    await this.init();
    const nuevoRegistro = new Registro(format, text);
    this.guardados.unshift(nuevoRegistro);
    this._storage.set(BARCODE_GUARDADOS, this.guardados);
    console.log(this.guardados);
  }


}
