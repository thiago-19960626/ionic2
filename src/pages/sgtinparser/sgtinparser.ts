import { Component }        from '@angular/core';
import { NavController }    from 'ionic-angular';
import { BarcodeScanner }   from '@ionic-native/barcode-scanner';

@Component({
    selector: 'page-sgtinparser',
    templateUrl: 'sgtinparser.html'
})
export class SgtinParserPage{

    lastResult : any;
    result: any;

    sgtinTags = {
        "00": {Name: "Serial Shipping Container Code (SSCC)", Length: 18},
        "01": {Name: "Global Trade Item Number (GTIN)", Length: 14},
        "02": {Name: "GTIN of Trade Items", Length: 14},
        "10": {Name: "Batch of Lot Number", Length: -1},
        "11": {Name: "Production date (YYMMDD)", Length: 6},
        "12": {Name: "Due date (YYMMDD)", Length: 6},
        "13": {Name: "Packaging Date (YYMMDD)", Length: 6},
        "15": {Name: "Best Before Date (YYMMDD)", Length: 6},
        "17": {Name: "Expiration Date (YYMMDD)", Length: 6},
        "20": {Name: "Variant Number", Length: 2},
        "21": {Name: "Serial Number", Length: -1},
        "22": {Name: "Secondary Data Fields", Length: -1},
        "30": {Name: "Count of Items (Variable Measure Trade Items)", Length: -1},
        "37": {Name: "Count of Trade Items", Length: -1},
        "240": {Name: "Additional Item Identification", Length: -1},
        "241": {Name: "Customer Part Number", Length: -1},
        "242": {Name: "Made-to-Order Variation Number", Length: -1},
        "250": {Name: "Secondary Serial Number", Length: -1},
        "251": {Name: "Reference to Source Entity", Length: -1},
        "253": {Name: "Global Document Type Identifier (GDTI)", Length: -1},
        "254": {Name: "GLN Extension Component", Length: -1}
    };

    constructor(public navCtrl: NavController, public barcodeScanner: BarcodeScanner){
        this.lastResult = {
            code: ""
        };
    }

    sgtinQuery(){
        if(this.lastResult.type === undefined){
            this.lastResult.type ="Manual";
        }

        this.lastResult.codeType ="unknown";
        this.lastResult.codeDetails = "n/a";
        var urlRegex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
        if(this.lastResult.code.match(urlRegex)){
            this.lastResult.codeType = "Web URL";
        }

        var supiRegex = new RegExp("^[a-zA-Z0-9]{12}$");
        if(this.lastResult.code.match(supiRegex)){
            this.lastResult.codeType = "SUPI Code";
        } 

        var phoneRegex = new RegExp("^(00|\\+)?\\d{9}$");
        if(this.lastResult.code.match(phoneRegex)){
            this.lastResult.codeType ="Phone Number";
        }

        if(this.lastResult.code.startsWith("01")){
            this.lastResult.codeType = "SGTIN";
            this.lastResult.sgtinTags = this.parseSgtin(this.lastResult.code);
        }

        if(this.lastResult.code.startsWith(String.fromCharCode(29)) || this.lastResult.code.startsWith(String.fromCharCode(232) + "01")){
            this.lastResult.codeType ="SGTIN (FNC1)";
            this.lastResult.sgtinTags = this.parseSgtin(this.lastResult.code);
        }


    }

    scan(){
        this.barcodeScanner.scan().then(barcodeData =>{
            if(!barcodeData.cancelled){
                this.lastResult.code = barcodeData.text;                
                this.sgtinQuery();                                
            }
        }, err =>{
            alert(JSON.stringify(err));
        });
    }

    parseSgtin(code){
        if ((code === undefined) || (code === null)) {
            return;
        }

        var foundTags = [];
        var remainingCode = code;
        var nextTag;

        var finished = false;
        while (!finished) {
            var nextTagSize = this.getNextTagSize(remainingCode);
            
            if (nextTagSize <= 0) {                
                // removing 1 character (FNC1 usually)
                remainingCode = remainingCode.slice(1);
            }
            else {
                nextTag = remainingCode.slice(0, nextTagSize);
                remainingCode = remainingCode.slice(nextTagSize);
                

                var newTag = { 
                    tagId: null,
                    tagName: null,
                    tagValue: null
                };
                var codeLen = this.sgtinTags[nextTag].Length;
                if (nextTag in this.sgtinTags) {
                    if (codeLen <= 0) {
                        // length is dynamic which means either next FNC character or end of the string...
                        codeLen = remainingCode.indexOf(String.fromCharCode(29));

                        if (codeLen < 0) {
                            codeLen = remainingCode.length;
                        }
                    }
                    newTag.tagId = nextTag;
                    newTag.tagName = this.sgtinTags[nextTag].Name;
                    newTag.tagValue = remainingCode.slice(0, codeLen);
                    foundTags.push(newTag);
                    remainingCode = remainingCode.slice(codeLen);
                }
                else {
                    newTag.tagId = nextTag;
                    newTag.tagName = "Unknown Tag";
                    newTag.tagValue = remainingCode.slice(0, codeLen);
                    foundTags.push(newTag);
                    finished = true;
                }

                if (remainingCode.length === 0) {
                    finished = true;
                }
            }
        }
        return foundTags;
    }

    getNextTagSize(code){
        if ((code.slice(0, 1) == "0") || (code.slice(0, 1) == "1") || (code.slice(0, 1) == "9")) {
            return 2;
        }

        if (code.slice(0, 1) == "2") {
            if ((code.slice(1, 2) == "0") || (code.slice(1, 2) == "1") || (code.slice(1, 2) == "2")) {
                return 2;
            }
            else {
                return 3;
            }
        }

        if (code.slice(0, 1) == "3") {
            if ((code.slice(1, 2) == "0") || (code.slice(1, 2) == "7")) {
                return 2;
            }
            else {
                return 3;
            }
        }

        if (code.slice(0, 1) == "4") {
            return 3;
        }

        if ((code.slice(0, 1) == "7") || (code.slice(0, 1) == "8")) {
            return 4;
        }

        return -1;
    }
}