import axios from "axios";
import https from "https";
import {ApiConfig} from "../config/api-config.js";

export default class ApiService {

    static instance = null;

    static makeInstance() {
        if(ApiService.instance === null) {
            ApiService.instance = new ApiService();
        }

        return ApiService.instance;
    }

    constructor() {
        this.axios = axios;
        this.axios.defaults.baseURL = `http${ApiConfig.isSecure ? 's' : ''}://${ApiConfig.host}${ApiConfig.endpoint}`;
        /**
         * Disable only in development mode
         */
        axios.defaults.httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        })

        this.config = ApiConfig
    }


    async get(endpoint) {
        try {
            const response = await this.axios.get(endpoint);
            return response.data;
        } catch (e) {
            console.error(e);
        }
    }

    async post(endpoint, payload) {
        try {
            const response = await this.axios.post(endpoint, payload);
            return response.data;
        } catch (e) {
            console.error(e);
        }
    }

    async postTypo3(endpoint, payload) {
        try {
            const response = await this.axios.post(endpoint, payload);
            return response.data;
        } catch (e) {
            console.error(e);
        }
    }

    getConfigurations() {
        return  this.get(ApiConfig.endpoints.getDeviceConfig);
    }

    checkUserPermissions(accessToken) {
        return this.post(ApiConfig.endpoints.checkPermission, {accessUid: accessToken});
    }


    checkUserPermissionsByUsername(username, clientId) {
        return this.post(ApiConfig.endpoints.checkPermissionByUsername, {payload: {username: username, clientId: clientId}});
    }

    checkInUser(checkInInfo) {
        return this.post(ApiConfig.endpoints.checkin, checkInInfo);
    }

    checkInUserOnTypo(checkInInfo) {

        let sessionUid = -1;

        if(checkInInfo.payload && checkInInfo.payload.session) {
            sessionUid = checkInInfo.payload.session.uid;
        }
        const param = `&token=${ApiConfig.token}&userUid=${checkInInfo.payload.customer.uid}&sessionUid=${sessionUid}`
        return this.postTypo3('https://'+ApiConfig.host+'/'+ApiConfig.endpoints.checkInUserTypo3+param);
    }

}