import AbstractDeviceService from "./AbstractDeviceService.js";
import LoggerService from "./LoggerService.js";
import ApiService from "./ApiService.js";
import DeviceController from "../controllers/device-controller.js";
import Helper from "../utils/Helper.js";
import {Dto} from "../models/Dto.js";

export default class NotificationService extends AbstractDeviceService{


    constructor(device) {
        super(device);
        this.api = ApiService.makeInstance();
    }


    wsOnOpen(e) {
        console.log('Connected to Notification-Server');

        /**
         * we inform the notification server who we are.
         * Needed on the serverside to send usercheck events only us, not the mobile app clients, which may be connected
         * to the server
         */
        this.wsConnection.send(this.messageHandler.whoIAm())
    }

    wsOnMessage(e) {
        this.messageHandler.updateMessage(e);
        switch (this.messageHandler.cmd) {
            case 'userEntry':
                if(this.messageHandler.data.device_type == 1) {
                    LoggerService.writeLog('User tries to enter front door');
                    this.checkUserPermissions(this.messageHandler.data, this.messageHandler.clientId);
                }
                if(this.messageHandler.data.device_type == 2) {
                    this.checkInUser(this.messageHandler.data, this.messageHandler.clientId);
                }
                break;
            case 'checkIn':
                this.notifyDisplays(this.messageHandler.data);
                break;
            default:
                console.log(`${this.messageHandler.cmd} is not implemented`);
        }
    }

    notifyDisplays(location) {
        console.log('notified display with location: ' + location);
        this.wsConnection.send(this.messageHandler.newCheckIn(location))
    }

    checkInUser(data, clientId) {
        const dto = new Dto();
        dto.payload = {
            user: data.user,
            location: data.location,
            clientId: clientId
        };

        const devices = DeviceController.findCheckInDeviceByLocation(this.messageHandler.data.location);

        console.log(`Trying to checkin User ${data.user} into location ${data.location}`);

        this.api.checkInUser(dto.returnObject).then(resp => {
            const respObject = resp[0];


            if(respObject.state === 200) {
                devices.forEach( device => {
                    device.deviceService.welcomeUserToCourse(respObject);
                })
                this.api.checkInUserOnTypo(respObject).then(resp => {
                    this.notifyDisplays(data.location);
                });
                respObject.Cmd = 'notifyApp'
                this.wsConnection.send(JSON.stringify(respObject));
            } else {
                devices.forEach( device => {
                    device.deviceService.informUserAboutError(respObject);
                })
                respObject.Cmd = 'notifyApp'
                this.wsConnection.send(JSON.stringify(respObject));
            }


        }).catch(error => {
            LoggerService.writeLog('ERROR checkInUser ' + error)
            console.log(error);
        });


    }


    openDoor(message) {
        const accessDevices = DeviceController.findAccessDevices();
        accessDevices.forEach(device => {
            device.deviceService.openDoor(message.payload.user);
        })

        message.Cmd = 'notifyApp'
        this.wsConnection.send(JSON.stringify(message));
    }

    openDoorPermanently() {
       throw new Error('not implemented!');
    }

    denyEntry(message) {
        const accessDevices = DeviceController.findAccessDevices();
        accessDevices.forEach(device => {
            device.deviceService.denyEntry();
        })
        message.Cmd = 'notifyApp'
        this.wsConnection.send(JSON.stringify(message));
    }

    checkUserPermissions(data, clientId) {

        console.log(data);
        console.log(clientId);

        LoggerService.writeLog(`User ${data.user} tried to enter`);
        this.api.checkUserPermissionsByUsername(data.user, clientId).then(resp => {
            const message = resp[0];

            if(message.state === 200 && Helper.validateToken(message.token)) {
                this.openDoor(message);
            } else {
                this.denyEntry(message);
            }


        }).catch(error => {
            LoggerService.writeLog('ERROR checkUserPermissions ' + error)
            console.log(error);
        });
    }

}