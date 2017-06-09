export class UserData{
    static accountEmail : string;
    static accountPhone : string;
    static registrationToken : string;
    static accountStatus : number;
    static isRegistered : boolean;
    static sessionToken : string;
    static isActivated : boolean;

    static json(){
        return {
            accountEmail: UserData.accountEmail,
            accountPhone: UserData.accountPhone,
            registrationToken: UserData.registrationToken,
            accountStatus: UserData.accountStatus,
            isRegistered: UserData.isRegistered,
            isActivated: UserData.isActivated,
            sessionToken: UserData.sessionToken
        }
    }
}

export class UserSetting{
    static language: string;
    static developerMode: boolean;
    static focusMode: string;
    static fpsMode : boolean;

    static json(){
        return {
            language: UserSetting.language,
            developerMode: UserSetting.developerMode,
            focusMode: UserSetting.focusMode,
            fpsMode: UserSetting.fpsMode
        };
    }
}

export var CodeHistory = [];