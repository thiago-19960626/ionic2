import { 
  NgModule, 
  ErrorHandler 
}                               from '@angular/core';
import { Http }                 from '@angular/http';
import { 
  IonicApp, 
  IonicModule, 
  IonicErrorHandler 
}                               from 'ionic-angular';
import { IonicStorageModule }   from '@ionic/storage';
import { MyApp }                from './app.component';
import {MomentModule}           from 'angular2-moment';
import { 
  TranslateModule , 
  TranslateStaticLoader, 
  TranslateLoader
}                               from 'ng2-translate/ng2-translate';
import { APIService }           from '../providers/api';
import { LoadingBar }           from '../providers/loading';
import { MessageBox }           from '../providers/alert';
import { DeviceUtil }           from '../providers/device';
import { Config }               from '../providers/config';
import { Action }               from '../providers/action';

import { AitQueryPage }         from '../pages/aitquery/aitquery';
import { AboutPage }            from '../pages/about/about';
import { SettingPage }          from '../pages/settings/settings';
import { HistoryPage }          from '../pages/history/history';
import { RegisterPage }         from '../pages/register/register';
import { ActivatePage }         from '../pages/activate/activate';
import { CodeCollectorPage }    from '../pages/codecollector/codecollector';
import { CollectionControlPage} from '../pages/collectioncontrol/collectioncontrol';
import { CollectionSamplePage } from '../pages/collectionsample/collectionsample';
import { SgtinParserPage }      from '../pages/sgtinparser/sgtinparser';
import { AitResultPage }        from '../pages/aitresult/aitresult';

import { SplashScreen }         from '@ionic-native/splash-screen';
import { Geolocation }          from '@ionic-native/geolocation';
import { BatteryStatus }        from '@ionic-native/battery-status';
import { BarcodeScanner }       from '@ionic-native/barcode-scanner';
import { Device }               from '@ionic-native/device';
import { EmailComposer }        from '@ionic-native/email-composer';
import { StatusBar }            from '@ionic-native/status-bar';
import { Network }              from '@ionic-native/network';

export function createTranslateLoader(http: Http) {
	return new TranslateStaticLoader(http, Config.i18n.localesDirectory, '.json');
}

@NgModule({
  declarations: [
    MyApp,
    AitQueryPage,
    AboutPage,
    SettingPage,
    HistoryPage,
    RegisterPage,
    ActivatePage,
    CodeCollectorPage,
    CollectionControlPage,
    CollectionSamplePage,
    SgtinParserPage,
    AitResultPage
  ],
  imports: [
    IonicModule.forRoot(MyApp,{
      menuType: 'overlay',
      mode: 'ios',
      backButtonIcon: 'ios-arrow-back-outline',
      backButtonText: '',
      modalEnter: 'modal-slide-in'      
    }),
    MomentModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    }),
    IonicStorageModule.forRoot({
        name: 'inextraceapp',
        driverOrder: ['sqlite','websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AitQueryPage,
    AboutPage,
    SettingPage,
    HistoryPage,
    RegisterPage,
    ActivatePage,
    CodeCollectorPage,
    CollectionControlPage,
    CollectionSamplePage,
    SgtinParserPage,
    AitResultPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    APIService,
    LoadingBar,
    MessageBox,
    DeviceUtil,
    Action,
    SplashScreen,
    BatteryStatus,
    BarcodeScanner,
    Device,
    EmailComposer,
    StatusBar,
    Network,
    Geolocation
    ]
})
export class AppModule {}
