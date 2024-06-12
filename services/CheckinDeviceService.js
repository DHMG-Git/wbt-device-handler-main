import AbstractDeviceService from "./AbstractDeviceService.js";
import ApiService from "./ApiService.js";
import LoggerService from "./LoggerService.js";
import {Dto} from "../models/Dto.js";
import DeviceController from "../controllers/device-controller.js";


/**
 * A checkInDevice implementation for Gantner Devices.
 *
 */
export default class CheckinDeviceService extends AbstractDeviceService {


    constructor(device) {
        super(device);
        this.api = ApiService.makeInstance();
    }


    wsOnOpen(e) {
        console.log(`Connected to device ${this.device.gid}`);
        if (e.type === 'open') {
            this.login();
        }
    }

    wsOnMessage(e) {
        this.messageHandler.updateMessage(e)
        switch (this.messageHandler.cmd) {
            case 'Login':
                this.registerForEvent();
                break;
            case 'Heartbeat':
                break;
            case 'App.CardIdent':
                const info = JSON.stringify(this.messageHandler.data);
                LoggerService.writeLog(`Card ${this.messageHandler.CardUid} wants to checkin into with info: ${info}`);
                console.log(this.messageHandler.message)
                this.tryToCheckInUser(this.messageHandler.CardUid);
                break;
            case 'userEntry':
                LoggerService.writeLog('Mobile App command ended in CheckInDevice, please check the configs')
                break;
            case 'GetDeviceInfo':
            case 'App.StartDenyProcess':
            case 'App.AppStateChanged':
            case 'RegisterEvent':
                break;
            default:
                console.log(this.messageHandler.message);
        }
    }

    login() {
        console.log('Trying to log in');
        this.wsConnection.send(this.messageHandler.login());
    }

    tryToCheckInUser(accessUid) {

        const dto = new Dto();
        dto.payload = {
            accessUid: accessUid,
            location: this.device.location
        };

        this.api.checkInUser(dto.returnObject).then(resp => {
            const respObject = resp[0];
            if (respObject.state === 200) {
                this.welcomeUserToCourse(respObject);
                this.api.checkInUserOnTypo(respObject).then(resp => {

                    const notification = DeviceController.getNotificationServer();
                    notification.forEach(device => {
                        device.deviceService.notifyDisplays(this.device.location);
                    })


                });
            } else {
                this.informUserAboutError(respObject);
            }


        }).catch(error => {
            LoggerService.writeLog('ERROR tryToCheckInUser ' + error)
            console.log(error);
        });
    }

    welcomeUserToCourse(respObject) {

        console.log(respObject);

        this.wsConnection.send(this.messageHandler.welcomeUser(respObject));
    }

    informUserAboutError(respObject) {
        this.wsConnection.send(this.messageHandler.noCourseOrForbidden(respObject));

    }
}