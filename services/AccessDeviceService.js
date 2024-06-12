import AbstractDeviceService from "./AbstractDeviceService.js";
import LoggerService from "./LoggerService.js";
import ApiService from "./ApiService.js";
import {PinConfig} from "../config/pin-config.js";

export default class AccessDeviceService extends AbstractDeviceService{


    constructor(device) {
        super(device);
        this.api = ApiService.makeInstance();
    }


    wsOnOpen(e) {
        console.log(`Connected to device ${this.device.gid}`);
        if(e.type === 'open') {
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
                this.log(`Someone tried to enter the frontdoor: ${this.messageHandler.CardUid ? 'CardUid: ' + this.messageHandler.CardUid : 'with PIN-Code'}`);
                this.checkUserPermissions(this.messageHandler.data);
                break;
            case 'GetDeviceInfo':
            case 'App.StartDenyProcess':
            case 'App.AppStateChanged':
            case 'RegisterEvent':
            case 'App.StartUnlockProcess':
            case 'App.UnlockProcessResult':
                break;
            default:
                console.log(this.messageHandler.message);
        }
    }


    log(type) {
        LoggerService.writeLog(`Device: ${this.device.gid}: ${type}`);
    }

    login() {
        console.log('Trying to log in');
        this.wsConnection.send(this.messageHandler.login());
    }

    openDoor(userName) {
        LoggerService.writeLog(`Opening Door for user ${userName}`);
        this.wsConnection.send(this.messageHandler.unlock(userName));
    }

    openDoorPermanently() {
        LoggerService.writeLog(`Door permanently opened`);
        this.wsConnection.send(this.messageHandler.unlockPermanent());
    }

    denyEntry() {
        LoggerService.writeLog(`Access denied.`);
        this.wsConnection.send(this.messageHandler.denyEntry());
    }

    /**
     * checks for a valid pin and returns a status
     * @param segments
     * @returns {int} -1: invalid, 1: onetime open, 2: permaOpen
     */
    checkPin(segments) {

        if(segments[0].SegmentType !== 'PIN_DATA') {
            return -1;
        }

        const pin = parseInt(segments[0].Data);

        if(!pin) {
            return -1;
        }

        if(pin === PinConfig.permanentPin) {
            return 2;
        }

        if(pin === PinConfig.oneTimePin) {
            return 1;
        }
    }

    checkUserPermissions(data) {

        if(data.CardType === 'PIN') {
            const pinResult = this.checkPin(data.Segments);

            if(pinResult < 0) {
               this.denyEntry();
           }
           if(pinResult === 1) {
               this.openDoor();
           }

           if(pinResult === 2) {
               //open door, till permaOpen is implemented based on a timetable
               this.openDoor()
               //this.openDoorPermanently();
           }
           return;
        }

        const cardUid = data.UID;
        LoggerService.writeLog(`Access Token ${cardUid} tried to enter`);
        this.api.checkUserPermissions(cardUid).then(resp => {
            const openObject = resp;
            //todo implement sercure token check;
            if(openObject.enter) {
                this.openDoor(openObject.user);
            } else {
                this.denyEntry();
            }


        }).catch(error => {
            console.log(error);
            LoggerService.writeLog('ERROR checkUserPermissions() ' + error)
        });
    }

}