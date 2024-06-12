import DeviceController from "./controllers/device-controller.js";
import ApiService from "./services/ApiService.js";

//fetch device config, when typo works, for now, we get the one from the configfile
const api = ApiService.makeInstance();
let deviceController = null;

api.getConfigurations().then(config => {
    deviceController = new DeviceController(config);
}).catch(error => {
    console.log(error);
});


