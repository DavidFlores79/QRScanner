import { Component } from '@angular/core';

import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { ToastController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  swipeOpts = {
    allowSlidePrev: false,
    allowSlideNext: false,
  };

  constructor(
    private barcodeScanner: BarcodeScanner,
    private toastController: ToastController,
    private dataLocal: DataLocalService
    ) {
    
  }

  ionViewWillEnter() {
    this.scan();
  }

  scan() {
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      
      if(!barcodeData.cancelled) {
        this.presentToast(barcodeData.text);
        this.dataLocal.guardarRegistro(barcodeData.format, barcodeData.text);
      }

     }).catch(err => {
         console.log('Error', err);
         this.dataLocal.guardarRegistro("QR_CODE", "geo:20.967284896588723,-89.67794428248988?q=20.967284896588723,-89.67794428248988");
     });
  }

  async presentToast(message: string) {
    let toast = await this.toastController.create({
      icon: 'information-circle',
      message,
      duration: 2000,
      position: "top"
    });

    await toast.present();
  }

}
