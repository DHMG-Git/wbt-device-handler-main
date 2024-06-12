import {Device} from "../models/device.js";

export default class DeviceController {

    static devices = [];


    static removeDevice(device) {
        const tidToRemove = device.gid();
        const indexToRemove = Device.devices.findIndex(device => {
            return device.gid() === tidToRemove;
        })
        DeviceController.devices.splice(indexToRemove, 1);
    }

    static findDeviceByGid(gid) {
        return DeviceController.devices.find(device => {
            return gid === device.gid;
        })
    }

    static findAccessDevices() {
        let devices = [];
        DeviceController.devices.forEach(device => {
            if(device.isAccessDevice()) {
                devices.push(device);
            }
        });
        return devices;
    }

    static findCheckInDeviceByLocation(locationId) {
        let devices = [];
        DeviceController.devices.forEach(device => {
            if(device.isCheckInDevice() && device.location == locationId) {
                devices.push(device);
            }
        });
        return devices;
    }

    static getNotificationServer() {
        let devices = [];
        DeviceController.devices.forEach(device => {
            if(device.isNotificationDevice()) {
                devices.push(device);
            }
        });
        return devices;
    }

    static logAllDevices() {
        DeviceController.devices.forEach(device => {
            device.print();
        })
    }


    static addDevice(deviceConfig) {

        const device = new Device(deviceConfig);
        DeviceController.devices.push(device);
        console.info('Device ||| %s ||| added to controller', device.name);
    }


    constructor(deviceConfigs) {
        this.init(deviceConfigs);
    }

    init(deviceConfigs) {
        console.info(`Fetched ${deviceConfigs.length} device configs`);

        deviceConfigs.forEach(config => {
            DeviceController.addDevice(config);
        })

        console.info('DeviceController init all fetched devices');
    }

}