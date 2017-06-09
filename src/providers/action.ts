import { Injectable } from '@angular/core';

@Injectable()
export class Action{
    private _name: string = null;
    private _data : string = null;

    setData(data: any){
        if(data){
            this._name = data.name;
            this._data = data.data;
        }
    }

    getData(){
        return {
            name: this._name,
            data: this._data
        };
    }

    clear(){
        this._name = null;
        this._data = null;
    }

    isEmpty(){
        return (this._name == null);
    }
}