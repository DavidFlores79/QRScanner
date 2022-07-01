import { Injectable } from '@angular/core';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Registro } from '../models/registro.model';

const BARCODE_GUARDADOS = 'guardados';
const nombreArchivo = 'registros.csv';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = [];
  private _storage: Storage | null = null;

  constructor(
    private storage: Storage,
    private navController: NavController,
    private inAppBrowser: InAppBrowser,
    private file: File,
    private emailComposer: EmailComposer
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
      const linea = `${ registro.type }, ${ registro.format }, ${ this.formatDate(registro.created_at) }, ${ this.replaceAll(registro.text,',', ' ') }\n`;
      arrayTemp.push(linea);
    });

    // console.log(arrayTemp.join(''));
    this.crearArchivo( arrayTemp.join('') );
    
  }

  crearArchivo( text: string ) { 

    this.file.checkFile(this.file.dataDirectory, nombreArchivo).then( existe => {
      console.log('Existe archivo', existe);
      return this.escribirEnArchivo( text );
    }).catch( err => {
      return this.file.createFile(this.file.dataDirectory, nombreArchivo, false)
                                .then( fueCreado => this.escribirEnArchivo(text))
                                .catch( error => console.log('Error: No se pudo crear el archivo. ', error))
    })
  }

  async escribirEnArchivo( text: string) {
    await this.file.writeExistingFile(this.file.dataDirectory, nombreArchivo, text);
    console.log('Archivo creado!');
    console.log(this.file.dataDirectory + nombreArchivo);
    const miArchivo = this.file.dataDirectory + nombreArchivo;

    const email = {
      to: 'davidflorescastillo@gmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        miArchivo
      ],
      subject: 'Historial de QRScanner',
      body: 'Hola cómo estás? Saludos desde <strong>App Android QRScanner</strong>',
      isHtml: true
    }
    
    // Send a text message using default options
    this.emailComposer.open(email);
  }

  padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  
  formatDate(date) {
    return date.getFullYear() +"/"+ (this.padTo2Digits(date.getMonth()+1)) +"/"+ this.padTo2Digits(date.getDate()) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  }

  replaceAll(string, search, replace) {
    return string.split(search).join(replace);
  }

}
