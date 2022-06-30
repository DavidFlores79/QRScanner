import { Injectable } from '@angular/core';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Registro } from '../models/registro.model';

const BARCODE_GUARDADOS = 'guardados';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = [];
  private _storage: Storage | null = null;

  constructor(
    private storage: Storage,
    private navController: NavController,
    private inAppBrowser: InAppBrowser
    ) {
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

    this.abrirRegistro(nuevoRegistro);
  }

  abrirRegistro( registro: Registro ) {
    this.navController.navigateForward('/tabs/tab2');

    switch (registro.type) {
      case 'http':
        this.inAppBrowser.create(registro.text, '_system');
        break;
      case 'geo:':
        this.navController.navigateForward(`tabs/tab2/mapa/${registro.text}`); //ruta completa
        break;
    
      default:
        break;
    }
  }

  enviarCorreo() {
    const arrayTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';

    arrayTemp.push(titulos);
    this.guardados.forEach(registro => {
      const linea = `${ registro.type }, ${ registro.format }, ${ this.formatDate(registro.created_at) }, ${ registro.text.replace(',', '|') }\n`;
      arrayTemp.push(linea);
    });

    console.log(arrayTemp.join(''));
    
  }

  padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  
  formatDate(date) {
    return date.getFullYear() +"/"+ (this.padTo2Digits(date.getMonth()+1)) +"/"+ this.padTo2Digits(date.getDate()) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  }

}
