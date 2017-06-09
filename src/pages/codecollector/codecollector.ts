import { Component}                 from '@angular/core';
import { 
    NavController, 
    ModalController, 
    Events 
}                                   from 'ionic-angular';
import { Storage }                  from '@ionic/storage';
import { CollectionControlPage }    from '../collectioncontrol/collectioncontrol';
import { CollectionSamplePage }     from '../collectionsample/collectionsample';
import { MessageBox }               from '../../providers/alert';

@Component({
    selector: 'page-codecollector',
    templateUrl: 'codecollector.html'
})
export class CodeCollectorPage {

    collections = [];

    constructor(
        public navCtrl: NavController,
        public modalCtrl:ModalController,
        public events: Events,
        public msgBox: MessageBox,
        public storage: Storage
    ){
        
        this.storage.ready().then(() =>{
            this.storage.get('collections').then(data =>{
                if(data){
                        this.collections = JSON.parse(data);
                    }            
                }, err =>{
                    console.log("collections is empty");
                });
        });
        

        this.events.subscribe('collection:add', collection => {
            console.log(collection);
            this.collections.push(collection);
            this.storage.ready().then(() =>{
                this.storage.set('collections', JSON.stringify(this.collections));
            });            
            this.reindexcollection();
        });
        this.events.subscribe('collection:edit', collection => {
            if(collection){
                for(var i = 0; i< this.collections.length; i++){
                    if(this.collections[i].id == collection.id){
                        this.collections[i] = collection;
                    }
                }
                this.storage.ready().then(() =>{
                    this.storage.set('collections', JSON.stringify(this.collections));
                });                
                this.reindexcollection();
            }            
        });
    }

    addcollection(){
        let modal = this.modalCtrl.create(CollectionControlPage , { action: 'add' });
        modal.present();   
    } 

    editcollection(collection){
        let modal = this.modalCtrl.create(CollectionControlPage, { action: 'edit', collection: collection });
        modal.present();
    }

    deletecollection(collection){
        var index = this.collections.indexOf(collection);
        if(index >= 0){
            this.msgBox.showConfirm(
                "Delete Collection",
                "Confirm deletion of the collection '" + collection.name + "'",
            [
            {
                text: 'Cancel',
                handler: ()=>{

                }
            },
            {
                text: 'OK',
                handler: ()=>{
                    this.collections.splice(index, 1);
                    this.storage.ready().then(() =>{
                        this.storage.set('collections', JSON.stringify(this.collections));
                    });                    
                    this.reindexcollection();
                }
            }
            ]);
        }
    }

    reindexcollection(){
        this.collections.forEach((value, index) =>{
            value.id = index;
        });
    }

    ionViewWillLeave(){
        this.events.unsubscribe('collection:add');
        this.events.unsubscribe('collection:edit');
    }

    collectionsample(name){
        let modal = this.modalCtrl.create(CollectionSamplePage, { collection: name });
        modal.present();
    }
}