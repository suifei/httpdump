import { mylog, parseTime } from "../log"
import { list } from "./cookie"

export function hook_httpdump() {
    try {
        const completionHandlerBlocks = new Set();

        var className = "NSURLSession";
        var funcName = "- dataTaskWithRequest:completionHandler:";
        var hook = eval('ObjC.classes.' + className + '["' + funcName + '"]');
        Interceptor.attach(hook.implementation, {
            onEnter: function (args) {
                const req = new ObjC.Object(args[2]);
                mylog('httpdump', parseTime(new Date(), null))
                const block = new ObjC.Block(args[3]);
                completionHandlerBlocks.add(block); // Keep it alive
                const appCallback = block.implementation;
                block.implementation = (data, response, error) => {
                    const retJson = TRACE_RESPONSE_INFO(response, data)
                    mylog('httpdump', 'RESPONSE')
                    mylog('httpdump', JSON.stringify(retJson, null, 2))
                    // callback block
                    const result = appCallback(data, response, error);
                    completionHandlerBlocks.delete(block);
                    return result;
                };
                const retJson = TRACE_REQUEST_INFO(req)
                mylog('httpdump', 'REQUEST')
                mylog('httpdump', JSON.stringify(retJson, null, 2))
            },
        });
    }
    catch (error) {
        mylog('httpdump', "[!] Exception: " + error);
    }
}

function TRACE_REQUEST_INFO(req: any): any {
    const timestamp = (new Date()).valueOf();
    let retJson: any = {}
    retJson.timestamp = timestamp
    retJson.handle = req
    retJson.method = req.HTTPMethod() + ''
    retJson.url = req.URL() + ''
    retJson.headers = {}

    //headers
    let gzip = false;
    if (req.allHTTPHeaderFields) {
        const headers = req.allHTTPHeaderFields()
        if (headers != null) {
            const enumerator = headers.keyEnumerator()
            let key = ''
            let val = ''
            while ((key = enumerator.nextObject()) !== null) {
                key = key + ''
                val = headers.objectForKey_(key) + ''
                retJson.headers[key] = val
                if (key.toLowerCase() === 'Operation-Type'.toLowerCase()) {
                    retJson.operationType = val
                }
                if (val.indexOf("gzip") != -1) {
                    gzip = true;
                }
            }
        }
    }
    //cookies
    const cookies = list()
    if (cookies != null) {
        let cookieText = ''
        cookies.forEach(cookie => {
            if (cookie.domain === 'mobile.12306.cn') {
                cookieText += ` ${cookie.name}=${cookie.value};`
            }
        });
        cookieText = cookieText.trim();
        retJson.headers.Cookie = cookieText
    }
    //////////////////
    retJson.body = null;
    if (req.HTTPMethod() != 'GET') {
        let reqBody = req.HTTPBody()//$methods
        if (gzip && reqBody && reqBody != NULL) {
            reqBody = decompressGZip(reqBody);
        }
        retJson.body = valueOf(reqBody)
    }

    return retJson
}

function TRACE_RESPONSE_INFO(resp: any, body: any) {
    const timestamp = (new Date()).valueOf()

    let retJson: any = {}
    retJson.timestamp = timestamp
    retJson.handle = resp
    retJson.headers = {}
    //headers
    let gzip = false;
    if (resp.allHeaderFields) {
        const headers = resp.allHeaderFields()
        if (headers != null) {
            const enumerator = headers.keyEnumerator()
            let key = ''
            let val = ''
            while ((key = enumerator.nextObject()) !== null) {
                key = key + ''
                val = headers.objectForKey_(key) + ''
                retJson.headers[key] = val
                if (key.toLowerCase() === 'Set-Cookie'.toLowerCase()) {
                    retJson.setCookie = val
                }
                if (val.indexOf("gzip") != -1) {
                    gzip = true;
                }
            }
        }
    }
    retJson.body = "";
    if (body && body != NULL) {
        try {
            if (gzip) {
                retJson.body = valueOf(decompressGZip(body));
            }
            if (retJson.body == "" || retJson.body == "null") {
                retJson.body = valueOf(body)
            }
        } catch {
            retJson.body = + ''
        }
    }
    return retJson
}

export function decompressGZip(buf: any) {
    //todo decompressGZip
    return buf;
}

export function valueOf(raw: any) {
    try {
        var o = new ObjC.Object(raw);
        return o + ""
    } catch {
        return raw + ""
    }
}