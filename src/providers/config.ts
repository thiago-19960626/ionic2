export var Config = {
    appVersion: '1.0.6',
    appName: 'Inextrace Demo',
    copyright: 'Inexto SA',
    allowPhoneRegistration: false,
    instance: {
        name: 'Inextrace Demo',
        endpoint: 'https://demo.ait-tc.com/api',
        captureGeoLocation: false
    },
    imageHandler: {
        endpoint: 'https://mobileconfig.ait-tc.com/ImageHandler.ashx?imageName=%IMGNAME%&width=%WIDTH%&height=%HEIGHT%',
        width: '35',
        height: '60',
        displayImage: true
    },
    i18n: {
        localesDirectory: './assets/i18n',
        locales: [ 'en', 'fr', 'es', 'kz', 'ru', 'cn', 'it', 'uk'],
        preferred: 'en'
    },
    google: {
        clientId: '',
        cryptoKey: ''
    },
    manatee_works: {
        focusMode: 'auto',
        fpsMode: false,
        android_mw: {
        key: ''
        },
        ios_mw: {
        key: ''
        }
    }
};

export var AccountStatusEnum = Object.freeze({
    UNKNOWN:   -1,
    PENDING:    0,
    VALIDATED:  1,
    ACTIVATED:  2,
    REJECTED:   3,
    BLOCKED:    4,
    INVALIDSESSION: 5,
    SESSIONEXPIRED: 6,
});

export var ActivationMessageEnum = Object.freeze({
    UNKNOWN:   -1,
    SUCCESS:    0,
    WRONGCODE:  1,
    OTHERERROR: 2,
    INVALIDTOKEN: 3
});

export var RenewSessionStatusEnum = Object.freeze({
    UNKNOWN:               -1,
    SUCCESS:                0,
    WRONGCODE:              1,
    EXPIREDSESSION:         2,
    INVALIDTOKEN:           3
});

export var HttpAccountStatusEnum = Object.freeze({
    BADREQUEST:          400,
    UNAUTHORIZED:        401,
    FORBIDDEN:           403,
    NOTFOUND:            404,
    TIMEOUT:             408,
    INTERNALSERVERERROR: 500,
    PENDING:             530,
    VALIDATED:           531,
    ACTIVATED:           532, // should not be needed because code will be HTTP 200 in this case
    REJECTED:            533,
    BLOCKED:             534,
    NOSECURITYROLES:     535,
    NODATAACCESS:        536,
    USERACCOUNTNOTFOUND: 537
});

export var QueryResultStatusEnum = Object.freeze({
    SUCCESS:               0, //'Success',
    NOQUERYACCESS:         1, //'NoQueryAccess',
    INVALIDCODE:           2, //'InvalidCode',
    MANUFACTURERMISMATCH:  3, //'ManufacturerMismatch',
    UNAUTHORIZEDACCESS:    4, //'UnauthorizedAccess',
    NODECODEDITEM:         5, //'NoDecodedItem',
    GTINNOTAPPROVED:       6, //'GTINNotApproved',
    INFRASTRUCTUREERROR:   7  //'InfrastructureError'
});

export var EventTypes = Object.freeze({
    Unknown:         0,
    Shipment:        1,
    Open:            2,
    Return:          3,
    Reception:       4,
    Robbery:         5
});

export var AuthenticationValidity = Object.freeze({
    None:          0,
    Valid:         1,
    Duplicate:     2,
    Counterfeit:   3,
    Waste:         4,
    Invalid:       5
});