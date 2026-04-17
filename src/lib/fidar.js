import { Fidar } from "fidar-web-sdk";

export const fidar = new Fidar({
    auth: {
        clientId: "anis",
        realm: "FIDAR_WEBAUTH_V2",
    }
});