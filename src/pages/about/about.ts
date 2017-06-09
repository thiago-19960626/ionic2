import { Component }            from '@angular/core';
import { 
    NavController, 
    Events 
}                               from 'ionic-angular';
import { Storage }              from '@ionic/storage';
import { BatteryStatus }        from '@ionic-native/battery-status';
import { DeviceUtil }           from '../../providers/device';
import { Config }               from '../../providers/config';
import { UserSetting }          from '../../providers/user';


@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})
export class AboutPage {
    
    about  = {
        currentYear: new Date(),
        appVersion : Config.appVersion,
        appName: Config.appName,
        copyright: Config.copyright,
        server: Config.instance.endpoint
    };

    deviceinfo : any;
    developerClick = 0;
    subscription1 : any;
    subscription2 : any;
    subscription3 : any;
    developerMode = UserSetting.developerMode;    

    constructor(
        public navCtrl: NavController, 
        public deviceUtil: DeviceUtil,
        public events: Events,
        public storage: Storage,
        public batteryStatus: BatteryStatus
    ){
        this.deviceUtil.getDeviceInfo().then(deviceInfo => {
            this.deviceinfo = deviceInfo;
        });

        this.subscription1 = this.batteryStatus.onChange().subscribe(status => {
            this.deviceinfo.batteryLevel = status.level;
            this.deviceinfo.isPlugged = status.isPlugged;
        });
        this.subscription2 = this.batteryStatus.onLow().subscribe(status => {
            this.deviceinfo.batteryLevel = status.level;
            this.deviceinfo.isPlugged = status.isPlugged;
        });
        this.subscription3 = this.batteryStatus.onCritical().subscribe(status =>{
            this.deviceinfo.batteryLevel = status.level;
            this.deviceinfo.isPlugged = status.isPlugged;
        });
    }

    aboutClick(){
        this.developerClick++;
        if(this.developerClick >= 10){
            this.developerClick = 0;
            this.developerMode = true;
            UserSetting.developerMode = this.developerMode;
            
            this.storage.ready().then(() =>{
                this.storage.set('userSettings', JSON.stringify(UserSetting));
            });               
            this.events.publish('userSetting:developerMode');     
        }
    }

    ionViewWillLeave(){
        this.subscription1.unsubscribe();
        this.subscription2.unsubscribe();
        this.subscription3.unsubscribe();
    }
}