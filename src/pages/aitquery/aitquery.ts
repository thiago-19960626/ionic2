import { Component }                               from '@angular/core';
import { 
    NavController,
    ModalController,
    Events 
}                               from 'ionic-angular';
import { BarcodeScanner }       from '@ionic-native/barcode-scanner';
import { Storage }              from '@ionic/storage';
import { TranslateService }     from 'ng2-translate';

import { RegisterPage }         from '../register/register';
import { ActivatePage }         from '../activate/activate';
import { AitResultPage }        from '../aitresult/aitresult';

import { CodeHistory }          from '../../providers/user';
import { APIService }           from '../../providers/api';
import { Action }               from '../../providers/action';


@Component({
    selector: 'page-aitquery',
    templateUrl: 'aitquery.html'
})
export class AitQueryPage {

    checkCodeResult = {};
    checkFormData = {
        supiCode: null
    };
    codeHistory = [];
    term : String;
        
    constructor( 
        public navCtrl: NavController,
        public apiService: APIService,
        public modalCtrl: ModalController,        
        public translateService : TranslateService,
        public events: Events,
        public barcodeScanner: BarcodeScanner,
        public storage: Storage,
        public action: Action        
        ){

        this.translateService.get("txtSupportedCodesList").subscribe(value => {
            this.term = value.replace(new RegExp("\r", "g"),"<br/>");
        });
    }

    ionViewWillEnter(){
        if(!this.action.isEmpty()){
            var temp = this.action.getData();
            if(temp.name == "scanQuery"){
                this.action.clear();
                this.scan();                
            }else if(temp.name == "queryResult"){
                this.checkFormData.supiCode = temp.data;
                this.action.clear();
                this.queryVerify();                
            }
        }
    }

    queryVerify(){
        this.apiService.check(this.checkFormData.supiCode).then(result => {
            if(result.aStatus == 0){
                console.log(result.data);
                var data = result.data;
                data.id = CodeHistory.length;
                data.TimeStamp = new Date();
                CodeHistory.push(data);
                this.storage.ready().then(() =>{
                    this.storage.set('codeHistory', JSON.stringify(CodeHistory));
                });  
                this.checkFormData.supiCode = '';              
                this.navCtrl.push(AitResultPage, { data: data });

            }else if(result.aStatus == -1){
                let modal = this.modalCtrl.create(RegisterPage);
                modal.present();
            }else if(result.aStatus == -2){
                let modal = this.modalCtrl.create(ActivatePage);
                modal.present();
            }else{
                this.checkFormData.supiCode = '';
            }
        });
    }

    scan(){
        this.barcodeScanner.scan().then(barcodeData =>{
            if(!barcodeData.cancelled){
                this.checkFormData.supiCode = barcodeData.text;                
                this.queryVerify();                                
            }
        }, err =>{
            alert(JSON.stringify(err));
        });
    }    
}
