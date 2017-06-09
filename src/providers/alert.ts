import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { TranslateService} from 'ng2-translate';

@Injectable()
export class MessageBox {
    constructor(public alertCtrl: AlertController, public translateService: TranslateService){

    }

    showAlert(title: string, content: string, callback = null){
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: content,
            buttons: [{
                text: "OK",
                handler: callback
            }]
        });
        return alert.present();
    }

    showConfirm(title: string, content: string, buttons: Array<any>){
        let confirm = this.alertCtrl.create({
            title: title,
            message: content,
            buttons: buttons
        });
        return confirm.present();
    }
}