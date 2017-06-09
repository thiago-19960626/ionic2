import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { 
    Config,
    HttpAccountStatusEnum,
    EventTypes,
    AuthenticationValidity,
    AccountStatusEnum,
    ActivationMessageEnum,
    QueryResultStatusEnum
} from './config';
import { MessageBox } from './alert';
import { LoadingBar } from './loading';
import { TranslateService} from 'ng2-translate';
import { UserData, UserSetting } from './user';
import { Storage }  from '@ionic/storage';
import { Network }  from '@ionic-native/network'
import { Events } from 'ionic-angular';

@Injectable()
export class APIService{

    constructor(
        public http: Http, 
        public translateService: TranslateService, 
        public msgBox: MessageBox,
        public loadingBar: LoadingBar,
        public events: Events,
        public storage: Storage,
        public network: Network){
        }

    register(requestData){
        return new Promise(resolve => {
            if(this.network.type == 'none'){
                this.msgBox.showAlert(this.translateService.instant('txtError'), this.translateService.instant('txtNotConnected')).then(ret => {
                    return resolve(null);
                });                
            }

            if(!requestData.accountPhone && !requestData.accountEmail){
                this.msgBox.showAlert(this.translateService.instant('txtError'),this.translateService.instant('txtProvidePhoneEmail')).then(ret => {
                    return resolve(null);
                });                
            }

            UserData.accountEmail = requestData.accountEmail;
            UserData.accountPhone = requestData.accountPhone;

            this.loadingBar.show("");

            let data = {
                PhoneNumber: requestData.accountPhone,
                Email: requestData.accountEmail
            };

            this.http.post(Config.instance.endpoint + "/Mobile/register", data)
            .map(res => res.json())
            .subscribe(ret => {
                this.loadingBar.close();
                console.log(ret);
                //success
                if(ret.RegistrationMessage == 0){
                    //save status and registration token
                    UserData.accountStatus = ret.Status;
                    UserData.registrationToken = ret.RegistrationToken;

                    switch(ret.Status){
                        case AccountStatusEnum.PENDING:
                        case AccountStatusEnum.VALIDATED:
                            if(ret.RegistrationToken === undefined){
                                this.msgBox.showAlert(this.translateService.instant('txtError'),this.translateService.instant('txtUnknownAccountGUID'), () => {
                                    return resolve(null);
                                });
                            }
                           
                            var msgText = "";
                            if(UserData.accountStatus == AccountStatusEnum.PENDING){
                                msgText = this.translateService.instant('txtPendingOn') + " " + Config.instance.name + ". " + this.translateService.instant('txtOnceAccountActivated') + ".";
                            }else{
                                msgText = this.translateService.instant('txtRegisteredOn') + " " + Config.instance.name + ". " + this.translateService.instant('txtEnterActCodeReceived') + ".";
                            }

                            UserData.isRegistered = true;
                            this.events.publish('isRegistered');

                            this.msgBox.showAlert(this.translateService.instant('txtActivationRequired'), msgText, ()=>{
                                return resolve(true);
                            });                               
                              
                           break;
                        case AccountStatusEnum.ACTIVATED:                            
                            
                            UserData.isRegistered = true;
                            this.events.publish('isRegistered');
                            this.msgBox.showAlert(this.translateService.instant('txtActivationRequired'), this.translateService.instant('txtRegisteredOn') + " " + Config.instance.name + ". " + this.translateService.instant('txtEnterActCodeReceived') + ".", ()=>{
                                return resolve(true);
                            });                  
                            
                            break;
                        default:
                            this.msgBox.showAlert(this.translateService.instant('txtError'),this.translateService.instant('txtUnknownRegistrationStatus'), ()=>{
                                return resolve(null);
                            });
                            break;
                    }

                    //save setting
                    this.storage.ready().then(() =>{
                        this.storage.set('accountStatus', JSON.stringify(UserData.json()));
                    });                    
                }else if(ret.RegistrationMessage == 4){
                    switch(ret.Status){
                        case AccountStatusEnum.REJECTED:
                            this.msgBox.showAlert(this.translateService.instant('txtError'), this.translateService.instant('txtAccountRejected'));
                            break;
                        case AccountStatusEnum.BLOCKED:
                            this.msgBox.showAlert(this.translateService.instant('txtError'),this.translateService.instant('txtAccountBlocked'));
                            break;
                        default:
                            this.msgBox.showAlert(this.translateService.instant('txtError'), this.translateService.instant('txtUnknownRegistrationStatus'));
                            break;
                    }
                    return resolve(null);
                }else{
                    this.msgBox.showAlert(this.translateService.instant('txtError'), this.getRegistrationMessage(ret.RegistrationMessage));
                    return resolve(null);
                }           
            }, err => {
                this.loadingBar.close();               
                this.msgBox.showAlert(this.translateService.instant('txtError'), this.getStatusError(err.status));                
                return resolve(null);
            });        
        });     
        
    }

    activate(pinCode){
        return new Promise(resolve => {
            if(this.network.type == 'none'){
                this.msgBox.showAlert(this.translateService.instant('txtError'),  this.translateService.instant('txtNotConnected'),() =>{
                    return resolve();
                });
            }

            var requestData = {
                RegistrationToken: UserData.registrationToken,
                ActivationCode: pinCode
            };

            this.loadingBar.show("");
            this.http.post(Config.instance.endpoint + "/Mobile/createSession", requestData)
            .map(res => res.json())
            .subscribe(ret => {
                this.loadingBar.close();

                UserData.sessionToken = ret.SessionToken;
                UserData.accountStatus = ret.Status;
                this.storage.ready().then(() =>{
                    this.storage.set('accountStatus', JSON.stringify(UserData.json()));
                });                

                switch(ret.ActivationMessage){
                    case ActivationMessageEnum.SUCCESS:
                         UserData.isActivated = true;
                         this.events.publish('isActivated');
                         this.storage.ready().then(() =>{
                            this.storage.set('accountStatus', JSON.stringify(UserData.json()));
                         });                         
                         this.msgBox.showAlert(this.translateService.instant('txtInformation'), this.translateService.instant('txtActivatedOn') + ' ' + Config.instance.name, ()=> {
                            return resolve();
                         });
                        break;
                    case ActivationMessageEnum.WRONGCODE:
                        this.msgBox.showAlert(this.translateService.instant('txtError'), this.translateService.instant('txtInvalidPin'), ()=>{
                            return resolve();
                        });
                        break;
                    case ActivationMessageEnum.INVALIDTOKEN:
                        this.msgBox.showAlert(this.translateService.instant('txtError'), this.translateService.instant('txtTechnicalProblem') + ' ' + this.translateService.instant('txtPleaseContactAdmin'), () =>{
                            return resolve();
                        });
                        break;
                    case ActivationMessageEnum.OTHERERROR:
                        this.msgBox.showAlert(this.translateService.instant('txtError'), this.translateService.instant('txtTechnicalProblem') + ' ' + this.translateService.instant('txtPleaseContactAdmin'), ()=> {
                            return resolve();
                        });
                        break;
                }
            }, err => {
                this.loadingBar.close();
                this.msgBox.showAlert(this.translateService.instant('txtError'), this.getStatusError(err.Status), () =>{
                    return resolve();
                });

            });

        });
    }

    check(code) : Promise<any>{
        return new Promise(resolve => {
            if(code == "developerMode" || code == "developermode"){
                UserSetting.developerMode = !UserSetting.developerMode;
                this.events.publish('userSetting:developerMode');
                this.msgBox.showAlert('Alert', 'Developer Mode: ' + UserSetting.developerMode ,() => {
                    return resolve({aStatus: -3});
                });
            }else{
                if(this.network.type == "none"){
                    this.msgBox.showAlert(this.translateService.instant('txtError'), this.translateService.instant('txtNotConnected'), ()=>{
                        return resolve({aStatus: -3});
                    });
                }

                if(!UserData.isActivated || !UserData.isRegistered){
                    return resolve({aStatus: -1}); // show register
                }

                this.loadingBar.show("");
                code = code.replace(/\s+/g, '').replace(/[\x1d]/g, '');
                
                var requestData = {
                    SessionToken : UserData.sessionToken
                };

                this.http.post(Config.instance.endpoint + "/Mobile/VerifyCode/" + code, requestData)
                .map(res => res.json())
                .subscribe(ret => {
                    this.loadingBar.close();

                    if((ret.QueryStatus == QueryResultStatusEnum.SUCCESS) && (ret.Code != null) && (ret.Code.length > 0)){
                        //store to history
                        return resolve({aStatus : 0, data : ret});
                    }else{
                        var errMSg = "";

                        if(ret.QueryStatus != null){
                            if(UserSetting.developerMode){
                                if(ret.QueryStatus == QueryResultStatusEnum.NOQUERYACCESS){
                                    errMSg = this.translateService.instant('txtNoAccessQuery');
                                }
                                if(ret.QueryStatus == QueryResultStatusEnum.MANUFACTURERMISMATCH){
                                    errMSg = this.translateService.instant('txtManufacturingMismatch');
                                }
                                if(ret.QueryStatus == QueryResultStatusEnum.GTINNOTAPPROVED){
                                    errMSg = this.translateService.instant('txtGTINNotApproved');
                                }
                                if(ret.QueryStatus == QueryResultStatusEnum.INFRASTRUCTUREERROR){
                                    errMSg = this.translateService.instant('txtInfrastructureError');
                                }
                            }else{
                                errMSg = this.translateService.instant('txtTechnicalProblem') + " " + this.translateService.instant('txtPleaseContactAdmin');
                            }

                            if(ret.QueryStatus == QueryResultStatusEnum.INVALIDCODE){
                                errMSg = this.translateService.instant('txtInvalidCode');
                            }
                            if(ret.QueryStatus == QueryResultStatusEnum.NODECODEDITEM){
                                errMSg = this.translateService.instant('txtItemNotDecoded');
                            }
                            if(ret.QueryStatus == QueryResultStatusEnum.UNAUTHORIZEDACCESS){
                                errMSg =  this.translateService.instant('txtUnauthorizedAccess');
                            }
                        }

                        if(errMSg === ''){
                            errMSg = this.translateService.instant('txtUnknownError') + '(' + ret.QueryStatus + '). ' + this.translateService.instant('txtPleaseContactAdmin');
                        }

                        this.msgBox.showAlert(this.translateService.instant('txtError'), errMSg, ()=>{
                            return resolve({aStatus: -3});
                        });
                    }

                }, err =>{
                    this.loadingBar.close();

                    if(err.Status == HttpAccountStatusEnum.UNAUTHORIZED){
                        UserData.accountStatus = AccountStatusEnum.SESSIONEXPIRED;
                        this.msgBox.showAlert(this.translateService.instant('txtError'), this.translateService.instant('txtSessionExpired'), ()=>{
                            return resolve({aStatus: -2});//show pin dialog
                        })
                    }else{
                        var msgText = this.getStatusError(err.Status);
                        switch(err.Status){
                            case HttpAccountStatusEnum.FORBIDDEN:
                                UserData.accountStatus = AccountStatusEnum.INVALIDSESSION;
                                this.logout(false);
                                break;
                            case HttpAccountStatusEnum.PENDING:
                                UserData.accountStatus = AccountStatusEnum.PENDING;
                                break;
                            case HttpAccountStatusEnum.VALIDATED:
                                UserData.accountStatus = AccountStatusEnum.VALIDATED;
                                break;
                            case HttpAccountStatusEnum.ACTIVATED:
                                UserData.accountStatus = AccountStatusEnum.ACTIVATED;
                                break;
                            case HttpAccountStatusEnum.REJECTED:
                                UserData.accountStatus = AccountStatusEnum.REJECTED;
                                break;
                            case HttpAccountStatusEnum.BLOCKED:
                                UserData.accountStatus = AccountStatusEnum.BLOCKED;
                                break;

                            case HttpAccountStatusEnum.USERACCOUNTNOTFOUND:
                                UserData.accountStatus = AccountStatusEnum.UNKNOWN;
                                this.logout(false);
                                break;
                            default:
                                break;
                        }

                        this.msgBox.showAlert(this.translateService.instant('txtError'), msgText, () =>{
                            return resolve({aStatus: -2});
                        });
                    }
                });
            }
        });        
        
    }

    logout(nofify){
        UserData.isActivated = false;
        UserData.isRegistered = false;
        UserData.accountEmail = null;
        UserData.accountPhone = null;
        UserData.accountStatus = null;
        UserData.registrationToken = null;
        UserData.sessionToken = null;
        UserSetting.developerMode=null;
        this.events.publish('resetaccount');

        if(nofify){
            this.msgBox.showAlert(this.translateService.instant('txtInformation'), this.translateService.instant('txtDeviceHasBeenUnregistered'));
        }
    }

    getAccountStatusMessage(accountStatus){
        
        if(accountStatus === 0){
            return this.translateService.instant('txtAccountValidationPending');
        }
        if(accountStatus === 1){
            return this.translateService.instant('txtAccountAlreadyValidated');
        }
        if(accountStatus === 2){
            return this.translateService.instant('value.txtAccountAlreadyActivated');
        }
        if(accountStatus === 3){
            return this.translateService.instant('txtInvalidActivationCode');
        }
        if(accountStatus === 4){
            return this.translateService.instant('txtUnknownError');
        }
    }

    getRegistrationMessage(registrationMessage){
        
        if(registrationMessage == 0){
            return this.translateService.instant('txtRegistrationMessageSuccessful');
        }
        if(registrationMessage ==1 ){
            return this.translateService.instant('txtRegistrationMessageInvalidEmail');
        }
        if(registrationMessage == 2){
            return this.translateService.instant('txtRegistrationMessageInvalidPhone');
        }
        if(registrationMessage == 3){
            return this.translateService.instant('txtRegistrationMessageInvalidActivationCode');
        }
        if(registrationMessage == 4){
            return this.translateService.instant('txtRegistrationMessageUnknownError');
        }          
    }

    getStatusError(status){        
        switch(status){
            case HttpAccountStatusEnum.BADREQUEST:
                return this.translateService.instant('txtError') + " (400 BAD REQUEST). " + this.translateService.instant('txtPleaseContactAdmin');
            case HttpAccountStatusEnum.UNAUTHORIZED:
                return this.translateService.instant('txtError') + ' (401 UNAUTHORIZED). ' + this.translateService.instant('txtPleaseContactAdmin');
            case HttpAccountStatusEnum.FORBIDDEN:
                return this.translateService.instant('txtError') + ' (403 FORBIDDEN). ' + this.translateService.instant('txtPleaseContactAdmin');
            case HttpAccountStatusEnum.NOTFOUND:
                return this.translateService.instant('txtError') + ' (404 NOT FOUND). ' + this.translateService.instant('txtPleaseContactAdmin');
            case 0:
            case HttpAccountStatusEnum.TIMEOUT:
                return this.translateService.instant('txtError') + ' (408 TIMEOUT). ' + this.translateService.instant('txtPleaseContactAdmin');
            case HttpAccountStatusEnum.INTERNALSERVERERROR:
                return this.translateService.instant('txtInternalServerErrorOn') + Config.instance.name + '. ' + this.translateService.instant('txtPleaseContactAdmin');
            case HttpAccountStatusEnum.PENDING:
                return this.translateService.instant('txtPendingOn') + ' ' + Config.instance.name + '. ' + this.translateService.instant('txtOnceAccountActivated');
            case HttpAccountStatusEnum.VALIDATED:
                return this.translateService.instant('txtRegisteredOn') + ' ' + Config.instance.name + '. ' + this.translateService.instant('txtEnterActCodeReceived');
            case HttpAccountStatusEnum.ACTIVATED:
                return this.translateService.instant('txtActivatedOn') + ' ' + Config.instance.name + '. ' + this.translateService.instant('txtEnterActCodeReceived');
            case HttpAccountStatusEnum.REJECTED:
                return this.translateService.instant('txtAccountRejectedOn') + ' ' + Config.instance.name + this.translateService.instant('txtPleaseContactAdmin');
            case HttpAccountStatusEnum.BLOCKED:
                return this.translateService.instant('txtAccountBlockedOn') + ' ' + Config.instance.name + '. ' + this.translateService.instant('txtPleaseContactAdmin');
            case HttpAccountStatusEnum.NOSECURITYROLES:
                return this.translateService.instant('txtNoSecurityRolesFoundOn') + ' ' + Config.instance.name + '. ' + this.translateService.instant('txtPleaseContactAdmin');
            case HttpAccountStatusEnum.NODATAACCESS:
                return this.translateService.instant('txtNoDataAccessConfiguredOn') + ' ' + Config.instance.name + '. ' + this.translateService.instant('txtPleaseContactAdmin');
            case HttpAccountStatusEnum.USERACCOUNTNOTFOUND:
                return this.translateService.instant('txtAccountNotFoundOn') + ' ' + Config.instance.name + '. ' + this.translateService.instant('txtPleaseRegister');
            default:
                return this.translateService.instant('txtError') + ' (' + status + '). ' +  this.translateService.instant('txtPleaseContactAdmin');
        }           
    }

    getEventType(eventType){
       switch(eventType){
           case EventTypes.Shipment:
             return 'li_truck';
            case EventTypes.Open:
              return 'ion-social-dropbox-outline';
            case EventTypes.Return:
              return 'ion-ios-undo-outline';
            case EventTypes.Reception:
              return 'ion-log-in';
            case EventTypes.Robbery:
              return 'ion-alert';
            default:
              return 'Invalid ItemType';
       }
    }

    getValidityShortDescription(validityStatus){
        
        switch(validityStatus){
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

    getValidityDescription(validityStatus){
        
        switch(validityStatus){
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

    getValidityCss(validityStatus){
        switch (validityStatus) {
          case AuthenticationValidity.None:
          case AuthenticationValidity.Waste:
            return 'alert-warning';
          case AuthenticationValidity.Valid:
            return 'alert-success';
          case AuthenticationValidity.Duplicate:
          case AuthenticationValidity.Counterfeit:
            return 'alert-danger';
          default:
            return '';
        }
    }

    getAuthenticationValidity(validity){
        var msgText = '';
        switch (validity) {
          case AuthenticationValidity.None: // 0
            msgText = 'Unknown';
            break;
          case AuthenticationValidity.Valid: // 1
            msgText = 'Valid';
            break;
          case AuthenticationValidity.Duplicate: // 2
            msgText = 'Duplicate';
            break;
          case AuthenticationValidity.Counterfeit: // 3
            msgText = 'Counterfeit';
            break;
          case AuthenticationValidity.Waste: // 4
            msgText = 'Waste';
            break;
          case AuthenticationValidity.Invalid: // 5
            msgText = 'Invalid';
            break;
          default:
            msgText = 'Unknown';
            break;
        }
        return msgText;
    }
}