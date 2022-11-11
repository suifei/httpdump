# httpdump
A generic HTTP/HTTPS protocol packet capture script tool for iOS App based on frida.

## How to Using?

You’ll need python3 installed.

```shell
$pip install frida-tools==9.2.5
#or
$pip install frida-tools
```

## How to Build

If you want to compile `HTTPDUMP` yourself, you can use the following steps.

You’ll need a Mac/Windows/Linux with `frida` installed.

Clone this repository and Install dependencies.
```shell
git clone https://github.com/suifei/httpdump.git
cd httpdump
npm i
```
Compile TypeScript.

```shell
npm run build
```
Done!

Run
```shell
frida -U -n AppName -l dist/httpdump.js
```

## License & Credits

Licensed under the MIT License. Refer to LICENSE.md.

httpdump was originally developed by suifei.
