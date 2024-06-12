import {ApiConfig} from "../config/api-config.js";

export default class MessageHelper {


    static command = Object.freeze({
        LOGIN: "Login",
        HEARTBEAT: "Heartbeat",
        INFO: "GetDeviceInfo",
        REGISTER_EVENT: "RegisterEvent",
        UNLOCK: "App.StartUnlockProcess",
        UNLOCK_PERMANENT: "App.StartUnlockProcess",
        SET_APPSTATE: "App.SetAppState",
        DENY_ENTRY: "App.StartDenyProcess",
        WHOIAM: "WhoIAm",
        CONFIRM: "App.StartConfirmProcess",
        NEW_CHECK_IN: "new_check_in"
    });

    static method = Object.freeze({
        REQUEST: "Req",
        RESPONSE: "Rsp",
        EVENT: "Evt",
    })


    constructor(deviceConfig) {
        this.deviceConfig = deviceConfig;
    }


    updateMessage(message) {
        this._message = JSON.parse(message.data);
    }

    get message() {
        return this._message;
    }

    get clientId() {
        return this.message.clientId;
    }

    get cmd() {
        return this.message.Cmd;
    }

    get data() {
        if (this.message.Data) {
            return this.message.Data;
        }
        return null;
    }

    get accessToken() {
        return this.message.Data.AccessToken;
    }

    get CardUid() {
        return this.message.Data.UID;
    }

    get gid() {
        return this.message.GID;
    }


    createMessage(type, payload) {

        let cmd;
        let mt;
        let data;

        type = type.toLowerCase();

        switch (type) {
            case 'login':
                cmd = MessageHelper.command.LOGIN;
                mt = MessageHelper.method.REQUEST;
                data = {
                    User: this.deviceConfig.user,
                    Password: this.deviceConfig.password
                };
                break;
            case 'heartbeat':
                cmd = MessageHelper.command.HEARTBEAT;
                mt = MessageHelper.method.REQUEST;
                break;
            case 'info':
                cmd = MessageHelper.command.INFO;
                mt = MessageHelper.method.REQUEST;
                break;
            case 'events':
                cmd = MessageHelper.command.REGISTER_EVENT;
                mt = MessageHelper.method.REQUEST;
                data = {Event: "App.*"}
                break;
            case 'unlock':
                cmd = MessageHelper.command.UNLOCK;
                mt = MessageHelper.method.REQUEST;
                data = {
                    DisplayText: `Hallo, ${payload.userName}!<br>Schön, dass du da bist!`,
                    IconName: "arrow-up",
                    Device: "INTERNAL"
                }
                break;
            case 'unlock_permanent':
                cmd = MessageHelper.command.SET_APPSTATE;
                mt = MessageHelper.method.REQUEST;
                data = {
                    Device: "INTERNAL",
                    AppState: "IDLE",
                    DisplayText: "Tritt ein, bring Glück herein",
                    IconName: "user-slash"
                }
                break;
            case 'deny_entry':
                cmd = MessageHelper.command.DENY_ENTRY;
                mt = MessageHelper.method.REQUEST;
                data = {
                    "DisplayText": "Keine Berechtigung! <br><small>Bei Fragen kannst du dich an das WBT-Team wenden.</small>",
                    "Timeout_ms": 5000,
                    "IconName": "frown",
                    "Device": "INTERNAL"
                };
                break;
            case 'whoiam':
                cmd = MessageHelper.command.WHOIAM;
                mt = MessageHelper.method.REQUEST;
                data = {
                    "token": ApiConfig.token,
                    "device": "device_handler"
                }
                break;
            case 'new_check_in':
                cmd = MessageHelper.command.NEW_CHECK_IN;
                mt = MessageHelper.method.REQUEST;
                data = {
                    token: ApiConfig.token,
                    location: payload.data.location
                }
                break;
            case 'welcome':
                cmd = MessageHelper.command.UNLOCK;
                mt = MessageHelper.method.REQUEST;
                data = {
                    DisplayText: `Hallo, ${payload.payload.customer.firstname}!<br>Schön, dass du da bist!`,
                    IconName: "arrow-up",
                    Device: "INTERNAL"
                }
                break;
            case 'no_course':
                cmd = MessageHelper.command.DENY_ENTRY;
                mt = MessageHelper.method.REQUEST;

                let message = '';

                if(payload && payload.payload && payload.payload.message) {
                    message = payload.payload.message;
                }

                data = {
                    "DisplayText": message,
                    "Timeout_ms": 5000,
                    "IconName": "frown",
                    "Device": "INTERNAL"
                };
                break;
            default:
                console.error('Unknown Message Type');
        }

        let MessageObject = {};
        MessageObject.Cmd = cmd;
        MessageObject.MT = mt;
        MessageObject.GID = this.deviceConfig.gid;
        data ? MessageObject.Data = data : '';

        return MessageObject;
    }

    heartbeat() {
        return JSON.stringify((this.createMessage('heartbeat')))
    }

    login() {
        let message = this.createMessage('login');
        return JSON.stringify(message);
    }

    whoIAm() {
        let message = this.createMessage('whoiam');
        return JSON.stringify(message);
    }

    getDeviceInfo() {
        console.log('getting device Info');
        let message = this.createMessage('info');
        return JSON.stringify(message);
    }

    registerToEvents() {
        console.log('register to events');
        let message = this.createMessage('events');
        return JSON.stringify(message);
    }

    unlock(userName) {
        console.log('unlocking!');
        let message = this.createMessage('unlock', {userName: userName});
        return JSON.stringify(message);
    }

    unlockPermanent() {
        let message = this.createMessage('unlock_permanent');
        return JSON.stringify(message);
    }

    denyEntry() {
        console.log('Entry denied!');
        let message = this.createMessage('deny_entry');
        return JSON.stringify(message);
    }

    generateMessage(action) {
        let message = this.createMessage(action);
        return JSON.stringify(message);
    }

    newCheckIn(location) {
        let message = this.createMessage('new_check_in', {data: {location: location}});
        return JSON.stringify(message);
    }

    welcomeUser(dto) {
        let message = this.createMessage('welcome', dto);
        return JSON.stringify(message);
    }

    noCourseOrForbidden(dto) {
        let message = this.createMessage('no_course', dto);
        return JSON.stringify(message);
    }

}