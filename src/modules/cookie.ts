type Cookie = { [key: string]: string | boolean }
const PROPERTIES = ['version', 'name', 'value', 'domain', 'path', 'expiresDate', 'portList', 'sameSitePolicy']

function shared() {
    return ObjC.classes.NSHTTPCookieStorage.sharedHTTPCookieStorage()
}

function* cookies(storage: ObjC.Object) {
    const jar = storage.cookies()
    for (let i = 0; i < jar.count(); i++) {
        yield jar.objectAtIndex_(i)
    }
}

export function list(): Cookie[] {
    const result: Cookie[] = []
    for (const cookie of cookies(shared())) {
        const entry: Cookie = {}
        for (const prop of PROPERTIES) {
            const val = cookie[prop]()
            if (val) entry[prop] = val.toString()
        }
        entry.HTTPOnly = cookie.isHTTPOnly()
        entry.secure = cookie.isSecure()
        entry.sessionOnly = cookie.isSessionOnly()
        result.push(entry)
    }
    return result
}