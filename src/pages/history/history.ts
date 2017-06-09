import { Component }            from '@angular/core';
import { NavController }        from 'ionic-angular';
import { Storage }              from '@ionic/storage';
import { TranslateService }     from 'ng2-translate';

import { AitResultPage }        from '../aitresult/aitresult';
import { CodeHistory }          from '../../providers/user';
import { Config }               from '../../providers/config';
import { MessageBox }           from '../../providers/alert';

@Component({
    selector: 'page-history',
    templateUrl: 'history.html'
})
export class HistoryPage {

     history = CodeHistory;
     
     constructor(
         public navCtrl: NavController,
         public msgBox: MessageBox,
         public translateService: TranslateService,
         public storage: Storage
     ){
     }

     getProductImg(item){
        return Config.imageHandler.endpoint.replace('%IMGNAME%', item.BrandOwner + '/' + item.Product.ProductCode);
     }

     goToDetail(item){
         console.log(item);
        this.navCtrl.push(AitResultPage, { data: item });
     }

     confirmHistoryClear(){
        this.msgBox.showConfirm(
            this.translateService.instant('txtClearHistory'), 
            this.translateService.instant('txtClearHistoryConfirm'),
            [
                {
                    text: 'OK',
                    handler:()=>{
                        CodeHistory.splice(0, CodeHistory.length);
                        this.storage.ready().then(() =>{
                            this.storage.set('codeHistory',JSON.stringify([]));
                        });                        
                    }
                },
                {
                    text: 'Cancel'
                }
            ]
        );
     }
}