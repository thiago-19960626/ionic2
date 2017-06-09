import { Component }            from '@angular/core';
import { 
    NavController, 
    ViewController, 
    NavParams 
}                               from 'ionic-angular';
import { Storage }              from '@ionic/storage';
import { Geolocation }          from '@ionic-native/geolocation';
import { EmailComposer }        from '@ionic-native/email-composer';
import { BarcodeScanner }       from '@ionic-native/barcode-scanner';
import { MessageBox }           from '../../providers/alert';

declare var google;

@Component({
    selector: 'page-collectionsample',
    templateUrl: 'collectionsample.html'
})
export class CollectionSamplePage{
   
   codes = [];
   collection : any;
   lastResult : any;

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public msgBox: MessageBox,
        public barcodeScanner: BarcodeScanner,
        public emailComposer: EmailComposer,
        public geolocation: Geolocation,
        public storage: Storage){

        this.collection = this.navParams.get("collection");
        this.storage.ready().then(() =>{
            this.storage.get('collection_' + this.collection.uuid).then(data =>{
                if(data){
                    this.codes = JSON.parse(data);
                }                
            }, err=>{
                console.log("collection_" + this.collection.uuid+ "is empty");
            });
        });        
        this.lastResult = {
            code: ""
        };
    }

    close(){
        this.viewCtrl.dismiss();
    }

    addCodeToList(){
        var gpsData = {
            status: "Acquiring GPS...",
            latitude: null,
            longitude: null,
            accuracy: null,
            location: null
        };

        var codeInfo = {
            code: this.lastResult.code,
            timestamp: new Date().toJSON(),
            gps: gpsData
        };

        this.geolocation.getCurrentPosition().then((resp) => {
            gpsData.status = "OK";
            gpsData.latitude = resp.coords.latitude;
            gpsData.longitude = resp.coords.longitude;
            gpsData.accuracy = resp.coords.accuracy;

            var latlng= { lat: resp.coords.latitude, lng: resp.coords.longitude}; 
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({'location': latlng}, (results, status) =>{
                if(status == google.maps.GeocoderStatus.OK){
                    if(results.length > 0){
                        gpsData.location = results[0].formatted_address;
                        this.storage.ready().then(() =>{
                            this.storage.set("collection_" + this.collection.uuid, JSON.stringify(this.codes));
                        });                        
                    }else{
                        this.storage.ready().then(()=>{
                            this.storage.set("collection_" + this.collection.uuid, JSON.stringify(this.codes));
                        });                        
                    }
                }else{

                }
            }); 

            this.codes.push(codeInfo); 
            this.storage.ready().then(() =>{
                this.storage.set('collection_' +  this.collection.uuid, JSON.stringify(this.codes));
            });            
            this.lastResult.code = "";      

        }).catch(err => {
            console.log(err);
            codeInfo.gps.status = err.message;
            this.codes.push(codeInfo);
            this.storage.ready().then(() =>{
                this.storage.set('collection_' + this.collection.uuid, JSON.stringify(this.codes));
            });            
            this.lastResult.code = "";
        });
    }

    deleteCode(code){
        var index = this.codes.indexOf(code);
        if(index > -1){
            this.codes.splice(index, 1);
        }
        this.storage.ready().then(() =>{
            this.storage.set('collection_' + this.collection.uuid, JSON.stringify(this.codes));
        });        
    }

    exportByEmail(){
        var codeResult = '';
        this.codes.forEach((value, key)=>{
            var lat = '';
            var lng = '';
            var acc = '';
            var address = '';

            if(value.gps){
                if(value.gps.lat){
                    lat = value.gps.lat;
                }
                if(value.gps.lng){
                    lng = value.gps.lng;
                }
                if(value.gps.acc){
                    acc = value.gps.acc;
                }                
            }

            if(value.gps.location){
                address = value.gps.location;
            }

            codeResult += '<p><b>' + value.code + '</b>; ' + value.timestamp + '; ' + lat + '; ' + lng + '; ' + acc + '; ' + address + '</p>';
        });        

        this.emailComposer.open({
            to: '',
            cc: '',
            subject: 'Collection-' + this.collection.name,
            body: codeResult
        }).then(() =>{

        }).catch(err =>{
            this.msgBox.showAlert("", "Cannot Export (Plugin not present)");
        });
    }

    scan(){
        this.barcodeScanner.scan().then((barcodeData) => {
            if(!barcodeData.cancalled){
                this.lastResult.code = barcodeData.text;
                this.addCodeToList();
            }
        }, (err) => {
            alert(JSON.stringify(err));
        });
    }
}