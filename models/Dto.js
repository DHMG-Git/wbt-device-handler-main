import Helper from "../utils/Helper.js";
import AccessDeviceService from "../services/AccessDeviceService.js";
import CheckinDeviceService from "../services/CheckinDeviceService.js";
import {v4 as uuid} from 'uuid';
import NotificationService from "../services/NotificationService.js";
import {ApiConfig} from "../config/api-config.js";

export class Dto {

    _secureToken = ApiConfig.token;

    _returnObject = {
        token: null,
        payload: {

        }
    }

    constructor() {
        this._returnObject.token = this.token;
    }

    get token() {
        return this._secureToken;
    }

    get returnObject() {
        return this._returnObject;
    }

    set payload(payload) {
        this._returnObject.payload = payload;
    }
}