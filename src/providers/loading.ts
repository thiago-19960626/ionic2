import { Injectable } from '@angular/core';
import { LoadingController, Loading } from 'ionic-angular';

@Injectable()
export class LoadingBar{
    obj : Loading = null;
    constructor(public loadingCtrl: LoadingController){

    }

    show(message: string){
        if(this.obj == null){
            this.obj = this.loadingCtrl.create({
                content: message
            });
            this.obj.present();
        }
    }

    close(){
        if(this.obj != null){
            this.obj.dismiss();
            this.obj = null;
        }
    }
}