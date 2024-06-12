export const ApiConfig = {
    isSecure: true,
    endpoint: '/api/v1/',
    localNotificationServer: 'ws://localhost:3001',
    productionNotificationServer: 'ws://reitter.it-wolf.at:3666',
    host: process.env.NODE_ENV === 'dev' ? 'wbt-2021.ddev.site' : 'www.wir-bewegen-tirol.at',
    token: 'amfOdBqCIsvOvgHnCTsqNobznVC8Q5HH9ah3JOdV2lk2iQMiYtQfdsytB6iVBtHV',

    endpoints: {
        getDeviceConfig: 'configurations',
        checkPermission: 'user',
        checkPermissionByUsername: 'checkByUsername',
        checkin: 'userCheckin',
        checkInUserTypo3: 'portal/checkInUser?type=1515762357',
    }
};
