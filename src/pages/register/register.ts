import { Component }        from '@angular/core';
import { 
    ViewController, 
    ModalController 
}                           from 'ionic-angular';
import { Config }           from '../../providers/config';
import { APIService }       from '../../providers/api';
import { ActivatePage }     from '../../pages/activate/activate';
import { UserData }         from '../../providers/user';

@Component({
    selector: 'page-register',
    templateUrl: 'register.html'
})
export class RegisterPage {

    allowPhoneRegistration = Config.allowPhoneRegistration;
    registerData = {
        accountEmail: null,
        accountPhone: null
    };

    constructor( 
        public viewCtrl: ViewController, 
        public apiService: APIService,
        public modalCtrl: ModalController
        ){
    }

    close(){
        this.viewCtrl.dismiss();
    }

    onRegister(){        
        this.apiService.register(this.registerData).then(ret => {
            console.log(UserData.registrationToken);
            if(ret){
                this.viewCtrl.dismiss();
                let modal = this.modalCtrl.create(ActivatePage);
                modal.present();
            }
        });        
    }
}