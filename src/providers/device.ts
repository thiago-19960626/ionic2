import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device';

@Injectable()
export class DeviceUtil{

    constructor(public device: Device){

    }
    
    getDeviceInfo() : Promise<any>{
        return new Promise(resolve => {
            
            let deviceInfo = {
                deviceModel : this.device.model,
                uuid : this.device.uuid,
                cordova : this.device.cordova,
                model : this.device.model,
                platform : this.device.platform,
                version : this.device.version,
                batteryLevel: -1,
                isPlugged: false
            };
            return resolve(deviceInfo);            
        });
    }
}