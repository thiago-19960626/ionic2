import { Component, ViewChild }  from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar }             from '@ionic-native/status-bar';
import { SplashScreen }          from '@ionic-native/splash-screen';
import { Storage }               from '@ionic/storage';
import { TranslateService }      from 'ng2-translate';

import { AitQueryPage }          from '../pages/aitquery/aitquery';
import { AboutPage }             from '../pages/about/about';
import { SettingPage }           from '../pages/settings/settings';
import { HistoryPage }           from '../pages/history/history';
import { CodeCollectorPage }     from '../pages/codecollector/codecollector';
import { SgtinParserPage }       from '../pages/sgtinparser/sgtinparser';


import { UserSetting }           from '../providers/user';
import { UserData }              from '../providers/user';
import { CodeHistory }           from '../providers/user'
import { Config }                from '../providers/config';
import { DeviceInfo }            from '../providers/global';
import { DeviceUtil }            from '../providers/device';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;
  rootPage      = AitQueryPage;
  //secureStorage = new SecureStorage();
  developerMode = UserSetting.developerMode;

  constructor(
    public platform: Platform, 
    public deviceUtil : DeviceUtil, 
    public events: Events,
    public translateService: TranslateService,
    public storage: Storage,
    public splashScreen: SplashScreen,
    public statusBar: StatusBar){

    this.initializeApp();

    this.translateService.setDefaultLang('en');
    this.events.subscribe('userSetting:developerMode', ()=>{
      this.developerMode = UserSetting.developerMode;
      this.storage.ready().then(() =>{
          this.storage.set('userSettings', JSON.stringify(UserSetting.json()));
      });
    });

    this.events.subscribe('resetaccount', () =>{
      this.developerMode = UserSetting.developerMode;
      this.storage.ready().then(() =>{
          this.storage.set('userSettings', JSON.stringify(UserSetting.json()));
      });
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      
      this.statusBar.styleDefault();
      this.splashScreen.hide();  

      //
      UserSetting.language = Config.i18n.preferred;
      UserSetting.developerMode = false;
      UserSetting.focusMode = Config.manatee_works.focusMode;
      UserSetting.fpsMode = Config.manatee_works.fpsMode;           
     
      //get device information
      this.deviceUtil.getDeviceInfo().then(ret => {
         DeviceInfo.deviceModel=  ret.deviceModel;
         DeviceInfo.uuid = ret.uuid;
         DeviceInfo.device = ret.device;
         DeviceInfo.cordova = ret.cordova;
         DeviceInfo.model = ret.model;
         DeviceInfo.platform = ret.platform;
         DeviceInfo.version = ret.version;
      });

      //localstorage
      this.storage.ready().then(() =>{
          this.storage.get('accountStatus').then(data =>{
                if(data){
                  console.log("accountStatus: " + data);
                  data = JSON.parse(data);
                  UserData.accountPhone = data.accountPhone;
                  UserData.accountEmail = data.accountEmail;
                  UserData.sessionToken = data.sessionToken;
                  UserData.registrationToken = data.registrationToken;

                  if(data.sessionToken){
                    UserData.isRegistered = data.isRegistered;
                    UserData.isActivated = data.isActivated;            
                  }else if(data.isRegistered){
                    UserData.isRegistered = data.isRegistered;
                    UserData.isActivated = false;
                  }else{
                    UserData.isRegistered = false;
                    UserData.isActivated = false;
                  }
                }
            console.log(UserData.json());
          }, err =>{
            console.log("accountStatus is empty");
          });

          this.storage.get('codeHistory').then(data =>{            
              if(data){
                  console.log("codeHistory: " + data);
                  data = JSON.parse(data);
                  data.forEach((value, key)=>{
                    CodeHistory.push(value);
                  });
              }
          }, err =>{
            console.log("codeHistory is empty");
          });

          this.storage.get('userSettings').then(data=>{
              if(data){
                console.log("userSettings: " + data);
                data = JSON.parse(data);
                UserSetting.language = data.language;
                UserSetting.developerMode = data.developerMode;
                this.developerMode = data.developerMode;
                UserSetting.focusMode = data.focusMode;
                UserSetting.fpsMode = data.fpsMode;
                this.translateService.use(UserSetting.language);
              }
          });

      });
      /*
      this.secureStorage.create('accountStatus').then(() =>{

        this.secureStorage.get('accountStatus').then(data =>{
              if(data){
                console.log("accountStatus: " + data);
                data = JSON.parse(data);
                UserData.accountPhone = data.accountPhone;
                UserData.accountEmail = data.accountEmail;
                UserData.sessionToken = data.sessionToken;
                UserData.registrationToken = data.registrationToken;

                if(data.sessionToken){
                  UserData.isRegistered = data.isRegistered;
                  UserData.isActivated = data.isActivated;            
                }else{
                  UserData.isRegistered = false;
                  UserData.isActivated = false;
                }
              }
        }, err =>{
          console.log("accountStatus is empty");
        });

      });

      this.secureStorage.create('codeHistory').then(() =>{

        this.secureStorage.get('codeHistory').then(data =>{            
            if(data){
                console.log("codeHistory: " + data);
                data = JSON.parse(data);
                data.forEach((value, key)=>{
                  CodeHistory.push(value);
                });
            }
        }, err =>{
          console.log("codeHistory is empty");
        });

      });   

      this.secureStorage.create('userSettings').then(() =>{

        this.secureStorage.get('userSettings').then(data=>{
            if(data){
              console.log("userSettings: " + data);
              data = JSON.parse(data);
              UserSetting.language = data.language;
              UserSetting.developerMode = data.developerMode;
              UserSetting.focusMode = data.focusMode;
              UserSetting.fpsMode = data.fpsMode;
              this.translateService.use(UserSetting.language);
            }
        }, err =>{
              console.log("userSettins is empty");
              UserSetting.language = Config.i18n.preferred;
              UserSetting.developerMode = false;
              UserSetting.focusMode = Config.manatee_works.focusMode;
              UserSetting.fpsMode = Config.manatee_works.fpsMode;
        });
      });*/

    });
  }

  openPage(index) {
      switch(index){
        case 0:
            this.nav.setRoot(AitQueryPage);
            break;
        case 1:
            this.nav.setRoot(HistoryPage);
            break;
        case 2:
            this.nav.setRoot(CodeCollectorPage);
            break;
        case 3:
            this.nav.setRoot(SgtinParserPage);
            break;
        case 4:
            this.nav.setRoot(SettingPage);
            break;
        case 5:
            this.nav.setRoot(AboutPage);
            break;
      }
  }
}
