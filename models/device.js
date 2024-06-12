import Helper from "../utils/Helper.js";
import AccessDeviceService from "../services/AccessDeviceService.js";
import CheckinDeviceService from "../services/CheckinDeviceService.js";
import {v4 as uuid} from 'uuid';
import NotificationService from "../services/NotificationService.js";
import {ApiConfig} from "../config/api-config.js";

export class Device {

    _name = '';
    _localIP = '';
    _type = '';
    _user = '';
    _password = '';
    _connectionUrl = '';
    _location = '';
    _gid = '';
    _state = null;
    _accessToken = '';
    _deviceService = null;


    constructor(deviceConfig) {

        this._name = deviceConfig.device_name;
        this._localIP = deviceConfig.ip;
        this._type = parseInt(deviceConfig.device_type);
        this._user = deviceConfig.device_user;
        this._password = Helper.encodePassword(deviceConfig.device_password);
        this._connectionUrl = this.generateConnectionUrl();
        this._location = deviceConfig.location;
        this._gid = uuid();
        this._state = null;


        if (this.type === 1) { //ACCESS_APP
            this.deviceService = new AccessDeviceService(this);
        }

        if (this.type === 2) { // CHECKIN_APP
            this.deviceService = new CheckinDeviceService(this);
        }


        if (this.type === 3) {//notification server)
            this._connectionUrl = process.env.NODE_ENV === 'dev' ? ApiConfig.localNotificationServer : ApiConfig.productionNotificationServer;
            this.deviceService = new NotificationService(this);
        }
    }

    getConfig() {
        return {
            user: this.user,
            password: this.password,
            gid: this.gid,
        }
    }

    isAccessDevice() {
        return this.type === 1;
    }

    isCheckInDevice() {
        return this.type === 2;
    }

    isNotificationDevice() {
        return this.type === 3;
    }

    get deviceService() {
        return this._deviceService;
    }

    set deviceService(value) {
        this._deviceService = value;
    }


    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get localIP() {
        return this._localIP;
    }

    set localIP(value) {
        this._localIP = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get user() {
        return this._user;
    }

    set user(value) {
        this._user = value;
    }

    get password() {
        return this._password;
    }

    set password(value) {
        this._password = value;
    }

    get connectionUrl() {
        return this._connectionUrl;
    }

    set connectionUrl(value) {
        this._connectionUrl = value;
    }

    get location() {
        return this._location;
    }

    set location(value) {
        this._location = value;
    }

    login() {
        this.webSocket.send(this.message.login());
    }


    login() {
        const device = this.findDeviceByGid(deviceDto.gid);

        if (deviceDto.accessToken) {
            this.loggedInDevices++;
            device.accessToken = deviceDto.accessToken;
        } else {
            console.error('Something went wrong');
        }


    }


    print() {
        console.table({
            accessToken: this.accessToken,
            ip: this._deviceIp,
            connectionUrl: this.connectionUrl,
            gid: this.gid,
            state: Object.keys(DeviceState).find(key => DeviceState[key] === this.state),
        })
    }

    generateConnectionUrl() {

        const isSecure = false;
        const endpoint = '/api';

        return `ws${isSecure ? 's' : ''}://${this.localIP}${endpoint}`;
    }

    set gid(gid) {
        this._gid = gid;
    }

    get gid() {
        return this._gid;
    }

    set state(state) {
        this._state = state;
    }

    get state() {
        return this._state;
    }

    get accessToken() {
        return this._accessToken;
    }

    set accessToken(accessToken) {
        if (accessToken) {
            this._accessToken = accessToken;
            this.state = DeviceState.OK;
        }
    }

}