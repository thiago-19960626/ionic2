import { Component }            from '@angular/core';
import { 
    NavController, 
    ViewController, 
    ModalController 
}                               from 'ionic-angular';
import { RegisterPage }         from '../register/register';
import { APIService }           from '../../providers/api';
import { UserData }             from '../../providers/user';

@Component({
    selector: 'page-activate',
    templateUrl: 'activate.html'
})
export class ActivatePage {

    pinCode : string = '';
    email : string = UserData.accountEmail;

    constructor(
        public navCtrl: NavController, 
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public apiService: APIService
        ){}

    close(){
        this.viewCtrl.dismiss();
    }

    onKeyPad(key){
        if(key == -2){
            this.pinCode = '';
        }

        if(key == -1){
            var str = this.pinCode;
            if(str.length > 0){
                this.pinCode  = str.substring(0, str.length - 1);
            }
        }

        if(key >= 0 && key <= 9){
            this.pinCode +=parseInt(key);
        }
    }

    onActivate(){
        this.apiService.activate(this.pinCode).then(() => {
            this.viewCtrl.dismiss();
        });
    }

    showRegister(){
        this.viewCtrl.dismiss();
        let modal = this.modalCtrl.create(RegisterPage);
        modal.present();
    }
}