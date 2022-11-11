import {hook_httpdump} from "./modules/http"

if (ObjC.available) {
    hook_httpdump();
}
