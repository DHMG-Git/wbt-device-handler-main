import {ApiConfig} from "../config/api-config.js";

export default class Helper {

    static encodePassword(password) {
        let utf8String = Buffer.from(password, 'utf-8').toString();
        let base64String = Buffer.from(utf8String).toString('base64');

        return base64String;
    }

    static validateToken(token) {
        return token === ApiConfig.token;
    }

}