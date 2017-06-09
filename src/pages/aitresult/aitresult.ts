import { 
    Component, 
    ViewChild, 
    NgZone, 
    ElementRef
}                               from '@angular/core';
import { 
    NavController, 
    Content, 
    NavParams,
    ModalController
}                               from 'ionic-angular';
import { EmailComposer }        from '@ionic-native/email-composer';
import { TranslateService }     from 'ng2-translate';
import { 
    AuthenticationValidity, 
    Config, 
    EventTypes 
}                               from '../../providers/config';
import { MessageBox }           from '../../providers/alert';
import { Global }               from '../../providers/global';
import { Action }               from '../../providers/action';
import { AitQueryPage }         from '../aitquery/aitquery';
import * as $                   from 'jquery';

declare var google;

@Component({
    selector: 'page-aitresult',
    templateUrl: 'aitresult.html'
})
export class AitResultPage {

    panelShow = {
        ValidityDetails: false,
        Results: false,
        Authentication: true,
        Product: true,
        Manufacturing: true,
        Aggregation: true,
        Tracking: true,
        Map: true,
        Menu: true
    };

    viewOption = {
        DetailedView: false
    };

    data : any;  
    map : any;  
    lastScrollValue = 0;
    zone = new NgZone({enableLongStackTrace: false}); 
    imageviewer : boolean = false;  

    mapData = {
        markers: [],
        tooltips: [],
        trackingPaths: []
    };

    @ViewChild('content') content : Content;
    @ViewChild('map') mapElement: ElementRef;

    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public translateService: TranslateService,
        public msgBox: MessageBox,
        public emailComposer:EmailComposer,
        public modalCtrl:ModalController,
        public action: Action){
        
        this.data = this.navParams.get('data');              
    }

    ngAfterViewInit(){
        this.loadMap();
        $('.scroll-content').scroll((event) =>{
            this.lastScrollValue = $('page-aitresult ion-content div.scroll-content').scrollTop();
        });
    }

    loadMap(){
        var mapOptions = {
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          center: new google.maps.LatLng(46.50, 6.50),
          zoom: 7,
          zoomControl: true,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          styles: [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"administrative","elementType":"labels","stylers":[{"saturation":"-100"}]},{"featureType":"administrative","elementType":"labels.text","stylers":[{"gamma":"0.75"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"lightness":"-37"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f9f9f9"}]},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"saturation":"-100"},{"lightness":"40"},{"visibility":"off"}]},{"featureType":"landscape.natural","elementType":"labels.text.fill","stylers":[{"saturation":"-100"},{"lightness":"-37"}]},{"featureType":"landscape.natural","elementType":"labels.text.stroke","stylers":[{"saturation":"-100"},{"lightness":"100"},{"weight":"2"}]},{"featureType":"landscape.natural","elementType":"labels.icon","stylers":[{"saturation":"-100"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"saturation":"-100"},{"lightness":"80"}]},{"featureType":"poi","elementType":"labels","stylers":[{"saturation":"-100"},{"lightness":"0"}]},{"featureType":"poi.attraction","elementType":"geometry","stylers":[{"lightness":"-4"},{"saturation":"-100"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"},{"visibility":"on"},{"saturation":"-95"},{"lightness":"62"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road","elementType":"labels","stylers":[{"saturation":"-100"},{"gamma":"1.00"}]},{"featureType":"road","elementType":"labels.text","stylers":[{"gamma":"0.50"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"saturation":"-100"},{"gamma":"0.50"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"},{"saturation":"-100"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"lightness":"-13"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"lightness":"0"},{"gamma":"1.09"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"},{"saturation":"-100"},{"lightness":"47"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"lightness":"-12"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"saturation":"-100"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"},{"lightness":"77"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"lightness":"-5"},{"saturation":"-100"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"saturation":"-100"},{"lightness":"-15"}]},{"featureType":"transit.station.airport","elementType":"geometry","stylers":[{"lightness":"47"},{"saturation":"-100"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"water","elementType":"geometry","stylers":[{"saturation":"53"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":"-42"},{"saturation":"17"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"lightness":"61"}]}]
        };
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

        //remove all markers from the map
        for(var i = 0; i < this.mapData.markers.length; i++){
            this.mapData.markers[i].setMap(null);
        }

        for(var i = 0; i< this.mapData.trackingPaths.length; i++){
            this.mapData.trackingPaths[i].setMap(null);
        }

        this.mapData.markers = [];
        this.mapData.trackingPaths = [];
        this.mapData.tooltips = [];

        var coords = [];
        var icons = [];
        var names = [];
        var iCpt = 0;

        this.data.LocationCoordinates.forEach(function(value, key){
            if(iCpt == 0){
                icons.push('Factory');
            }else{
                icons.push('PinDrop');
            }

            names.push(value.LocationType + " ");
            coords.push(new google.maps.LatLng(value.Latitude, value.Longitude));
            iCpt++;
        });

        for(var i = 0; i < coords.length; i++){
            var sUrl = 'assets/images/marker' + icons[i] + '.png';
            var markerImage = new google.maps.MarkerImage(sUrl);
            var m = coords[i];
            var marker = new google.maps.Marker({
                position: m,
                map: this.map,
                draggable: false,
                animation: google.maps.Animation.DROP,
                icon: markerImage
            });
            this.mapData.markers.push(marker);
        }

        var trackingPath = new google.maps.Polyline({
            path: coords,
            strokeColor: '#ff3300',
            strokeOpacity: 0.75,
            strokeWeight: 2
        });
        trackingPath.setMap(this.map);
        this.mapData.trackingPaths.push(trackingPath);
        if(coords[0] !== undefined){
            this.map.panTo(coords[0]);
        }
    }

    scrollUp(){
        this.content.scrollToTop();
    }

    showImageViewer(){
        this.imageviewer = true;
    }

    showDisclaimer(){
        this.msgBox.showAlert("", this.data.Disclaimer);
    }

    getValidityShortDescription(){
        switch(this.data.Authentication.Validity){
            case AuthenticationValidity.None:
                return this.translateService.instant('txtValidityUnknown');
            case AuthenticationValidity.Valid:
                return this.translateService.instant('txtValidityValid');
            case AuthenticationValidity.Duplicate:
                return this.translateService.instant('txtValidityAlreadyChecked');
            case AuthenticationValidity.Counterfeit:
                return this.translateService.instant('txtValidityCounterfeit');
            case AuthenticationValidity.Waste:
                return this.translateService.instant('txtValidityWaste');
            case AuthenticationValidity.Invalid:
                return this.translateService.instant('txtValidityInvalid');
            default:
                return '';
        }        
    }

    getValidityDescription(){
        switch(this.data.Authentication.Validity){
            case AuthenticationValidity.None:
                return this.translateService.instant('txtDescriptionUnknown');
            case AuthenticationValidity.Valid:
                return this.translateService.instant('txtDescriptionValid');
            case AuthenticationValidity.Duplicate:
                return this.translateService.instant('txtDescriptionAlreadyChecked');
            case AuthenticationValidity.Counterfeit:
                return this.translateService.instant('txtDescriptionCounterfeit');
            case AuthenticationValidity.Waste:
                return this.translateService.instant('txtDescriptionWaste');
            case AuthenticationValidity.Invalid:
                return this.translateService.instant('txtDescriptionInvalid');
            default:
                return '';
        }        
    }

    getValidityCss(){
        return 'color-' + this.data.Authentication.Validity;
    }

    getProductImg(){
        return Config.imageHandler.endpoint.replace('%IMGNAME%', this.data.BrandOwner + '/' + this.data.Product.ProductCode);
    }

    getEventTypeCss(eventTypeId){
        switch(eventTypeId){
            case EventTypes.Shipment:
                return 'li_truck';
            case EventTypes.Open:
                return 'logo-dropbox';
            case EventTypes.Return:
                return 'ios-undo-outline';
            case EventTypes.Reception:
                return 'log-in';
            case EventTypes.Robbery:
                return 'alert';
            default:
                return 'Invalid ItemType';

        }
    }

    getEventType(eventType){
        switch(eventType){
            case EventTypes.Shipment:
                return this.translateService.instant('txtEventShipment');
            case EventTypes.Open:
                return this.translateService.instant('txtEventOpen');
            case EventTypes.Return:
                return this.translateService.instant('txtEventReturn');
            case EventTypes.Reception:
                return this.translateService.instant('txtEventReception');
            case EventTypes.Robbery:
                return this.translateService.instant('txtEventRobbery');
            default:
                return this.translateService.instant('txtEventInvalid');
        }
    }

    backAndQueryScan(){
        this.action.setData({
            name: "scanQuery"
        });      
        this.navCtrl.setRoot(AitQueryPage);
    }

    exportByEmail(){
        var codeResult = '<p><b>Code:</b> ' + this.data.Code + '</p>';

        if(this.data.Authentication && this.data.Authentication.Validity){
            codeResult +='<p><b>' + this.translateService.instant('txtAuthentication') + ':</b> ' + this.getValidityShortDescription() + '</p>';
        }
        codeResult +='<p><b>' + this.translateService.instant('txtBrandOwner') + ':</b> ' + this.data.BrandOwner + '</p>';
        codeResult +='<p><b>' + this.translateService.instant('txtPackagingLevel') + ':</b> ' + this.data.Product.PackagingLevel + '</p>';
        codeResult +='<hr/>';

        if(this.data.Product.ProductCode){
            codeResult +='<p><b>' + this.translateService.instant('txtProduct') + '</b></p>';
            codeResult +='<p><b>' + this.translateService.instant('txtProductCode') + ':</b> ' + this.data.Product.ProductCode + '</p>';
            codeResult +='<p><b>' + this.translateService.instant('txtProductDescription') + ':</b> ' + this.data.Product.ProductDescription + '</p>';
            codeResult +='<p><b>' + this.translateService.instant('txtDestinationMarket') + ':</b> ' + this.data.Product.DesignMarket + '</p>';
            
            if(Config.imageHandler.endpoint){
                var setImageName = Config.imageHandler.endpoint.replace('%IMGNAME%', this.data.BrandOwner + '/' + this.data.Product.ProductCode);
                //var setWidth = setImageName.replace('%WIDTH%', Config.imageHandler.width);
                var setHeight = setImageName.replace('%HEIGHT%', Config.imageHandler.height);
                codeResult +='<p><img src="' + setHeight + '" width="' + Config.imageHandler.width + '" height="' + Config.imageHandler.height + '"></p>';
            }
        }

        if(this.data.Manufacturing.Factory.Name){
            codeResult +='<p><b>' + this.translateService.instant('txtProduction') + '</b></p>';
            codeResult +='<p><b>' + this.translateService.instant('txtFactory') + ':</b> ' + this.data.Manufacturing.Factory.CountryCode + ' - ' + this.data.Manufacturing.Factory.Name + '</p>';
            codeResult +='<p><b>' +  this.translateService.instant('txtProductionDate') + ':</b> ' + this.data.Manufacturing.ProductionDateTime + '</p>';
            codeResult +='<p><b>' + this.translateService.instant('txtProductionLine') + ':</b> ' + this.data.Manufacturing.ProductionLine + '</p>';

            if(this.data.Authentication && this.data.Authentication.CodeGeneratorId){
                codeResult +='<p><b>' + this.translateService.instant('txtCodeGeneratorId') + ':</b> ' + this.data.Authentication.CodeGeneratorId + '</p>';
            }

            codeResult +='<hr/>';
        }

        if(this.data.Manufacturing.ParentItems.length > 0){
            codeResult +='<p><b>' + this.translateService.instant('txtAggregation') + '</b></p>';
            this.data.Manufacturing.ParentItems.forEach((value, key)=>{
                codeResult +='<p><b>' + value.Key + ':</b> ' + value.Value + '</p>';
            });

            codeResult +='<hr/>';
        }

        if(this.data.Disclaimer){
            codeResult +='<p><b>' + this.translateService.instant('txtDisclaimer') + '</b></p>';
            codeResult +='<p>' + this.data.Disclaimer + '</p>';
            codeResult +='<hr/>';
        }
        
        this.emailComposer.open({
            to: '',
            cc: '',
            subject: 'AIT Portal Query for ' + this.data.Code,
            body: codeResult,
            isHtml: true
        }).then(ret =>{
            
        }).catch(err =>{
            this.msgBox.showAlert("", this.translateService.instant('txtEmailExportNotAvailable'));
        });
            
    }

    queryParent(code){
        this.action.setData({
            name: 'queryResult',
            data: code
        });
        this.navCtrl.setRoot(AitQueryPage);  
    }

    getCountryName(code){
        return Global.getCountryName(code);
    }
}