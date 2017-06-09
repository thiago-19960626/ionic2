import { Component }        from '@angular/core';
import { 
    NavController, 
    ViewController, 
    NavParams, 
    Events 
}                           from 'ionic-angular';
import { Global }           from '../../providers/global';

@Component({
    selector: 'page-collectioncontrol',
    templateUrl: 'collectioncontrol.html'
})
export class CollectionControlPage {
    
    action : string;
    formData : {
        id ?: number,
        name ?: string,
        timestamp ?: string,
        uuid ?: string
    };

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public events: Events
    ){
        this.action = this.navParams.get('action');
        if(!this.navParams.get('collection')){
            this.formData = {
                id : -1,
                name: 'New',
                timestamp:  new Date().toJSON(),
                uuid: Global.getUuid()
            };
        }else{
            let collection = this.navParams.get('collection'); 
            this.formData = {
                id: collection.id,
                name: collection.name,
                timestamp: collection.timestamp,
                uuid: collection.uuid
            };
        }
    }

    close(){
        this.viewCtrl.dismiss();
    }

    addCollection(){
        if(this.action == 'add'){
            this.events.publish('collection:add', this.formData);
        }else if(this.action == 'edit'){
            this.events.publish('collection:edit', this.formData);
        }

        this.viewCtrl.dismiss();
    }
}