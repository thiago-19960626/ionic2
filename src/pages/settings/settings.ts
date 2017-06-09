import { Component }        from '@angular/core';
import { 
    NavController, 
    ModalController, 
    Events 
}                           from 'ionic-angular';
import { Storage }          from '@ionic/storage';
import { TranslateService}  from 'ng2-translate';

import { RegisterPage }     from '../register/register';
import { ActivatePage }       from '../activate/activate';

import { 
    UserData, 
    UserSetting,
    CodeHistory
}                           from '../../providers/user';
import { DeviceInfo }       from '../../providers/global';
import { APIService }       from '../../providers/api';


@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})

export class SettingPage {
    
    isActivated  = UserData.isActivated;
    isRegistered = UserData.isRegistered;
    platform = DeviceInfo.platform;
    developerMode = UserSetting.developerMode;

    language : string= 'en';
    focusMode : string = 'auto';
    fpsMode : boolean  = false;

    constructor(
        public navCtrl: NavController, 
        public modalCtrl: ModalController,
        public translateService: TranslateService,
        public apiService: APIService,
        public events: Events,
        public storage: Storage){

        this.language = UserSetting.language;
        this.focusMode = UserSetting.focusMode;
        this.fpsMode = UserSetting.fpsMode;

        this.events.subscribe('isActivated', ()=>{
            console.log('isActived event');
            this.isActivated = true;
        });
        this.events.subscribe('isRegistered', ()=>{   
            console.log('isRegister event');         
            this.isRegistered = true;
        });
    }

    logout(notifiy){
        this.isActivated = false;        
        this.isRegistered = false;     
        this.apiService.logout(notifiy);   
        this.storage.ready().then(()=>{     
            this.storage.set('accountStatus', JSON.stringify(UserData.json()));
        });
        CodeHistory.splice(0, CodeHistory.length);
        this.storage.ready().then(()=>{     
            this.storage.set('codeHistory', JSON.stringify([]));
        });

        this.storage.ready().then(() =>{
            this.storage.set('userSettings', JSON.stringify(UserSetting.json()));
        });           
    }

    setLanguage(){
        UserSetting.language = this.language;
        this.translateService.use(this.language);
        this.storage.ready().then(()=>{     
            this.storage.set('userSettings', JSON.stringify(UserSetting.json()));
        });
    }

    setFocusMode(){
        UserSetting.focusMode = this.focusMode;
        this.storage.ready().then(()=>{     
            this.storage.set('userSettings', JSON.stringify(UserSetting.json()));
        });
    }

    setFPSMode(){
        UserSetting.fpsMode = this.fpsMode;
        this.storage.ready().then(()=>{     
            this.storage.set('userSettings', JSON.stringify(UserSetting.json()));
        });
    }

    register(){
        let modal = this.modalCtrl.create(RegisterPage);
        modal.present();
    }

    activate(){
        let modal = this.modalCtrl.create(ActivatePage);
        modal.present();
    }
}