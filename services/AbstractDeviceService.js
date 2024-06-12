import {WebSocket} from "ws";
import MessageHelper from "../utils/Message-Helper.js";
import LoggerService from "./LoggerService.js";

export default class AbstractDeviceService {

    wsConnection = null;

    constructor(device) {
        this.device = device;
        this.wsConnection = new WebSocket(device.connectionUrl);
        this.messageHandler = new MessageHelper(device.getConfig());
        this.registerEventHandlers();
    }

    registerEventHandlers() {
        this.wsConnection.onopen = (e) => {
            this.wsOnOpen(e);
            this.startHeartBeat();
        };
        this.wsConnection.onerror = (e) => this.wsOnError(e);
        this.wsConnection.onmessage = (e) => this.wsOnMessage(e);
        this.wsConnection.onclose = (e) => this.wsOnClose(e);
    }

    wsOnOpen(e) {
        throw new Error('wsOnOpen has to be implemented');
    }

    wsOnError(e) {
        console.error('An Error occured!');
        console.log(e);
    }

    wsOnMessage(e) {
        throw new Error('wsOnMessage has to be implemented');
    }

    wsOnClose(e) {

        const message = `Lost Connection to ${this.device.name}`

        clearInterval(this.heartBeat);
        console.info(message);
        LoggerService.writeLog(message + ' Error: ' + e);
        throw new Error(message);//since we use pm2 in production the error causes a restart of the client, so we can reconnect to the server
    }

    sendHeartBeat() {
        const message = this.messageHandler.heartbeat();
        this.wsConnection.send(message);
    }

    startHeartBeat() {
        this.heartBeat = setInterval(() => {
            this.sendHeartBeat();
        }, 25000)
    }

    registerForEvent() {
        const message = this.messageHandler.getDeviceInfo();
        this.wsConnection.send(message);
        this.wsConnection.send(this.messageHandler.registerToEvents());
    }

}