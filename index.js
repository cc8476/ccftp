#!/usr/bin/env node

var colors = require('colors');
const utils = require('./utils.js');
let fs = require("fs");

const os = require('os');
let platform = os.platform() //darwin  win32
//test .........................................
//test .........................................

//test .........................................
//test .........................................


//test .........................................
//test .........................................



let param = process.argv[2]; //命令行第一个参数
switch (param) {
    case "-ftp":
        console.log("config your ftp settings".yellow);
        console.log("just select passport or privateKey to write down".yellow);
        utils.serialFtp().then((result) => {
            utils.writeFTPConfig(JSON.stringify(result))
        })

        break;
    case "-help":
        console.log("-ftp               >>> step1, config your ftp setting ".yellow);
        console.log("-files             >>> step2, config your upload path ".yellow);
        console.log("-clear             >>> clear your settings ".yellow);
        console.log("-view              >>> show your settings".yellow);
        console.log("default(no param)  >>> choose one to upload ".yellow);

        process.exit(0);
        break;
    case '-view':


        utils.select(["0.view from folder", "1.view directly"], (answer) => {
            let result = answer[0];
            result = result.replace("\"", "");
            let order = result.split(".")[0];

        
            switch (Number(order)) {
                case 0:
                    var exec = require('child_process').exec;
                    var cmd = ''
                    if(platform=='win32') {
                        cmd = 'explorer '+ __dirname;
                    }
                    else {
                        cmd = 'open ' + __dirname;
                    }
                    exec(cmd);
                    break;
                case 1:
                    try {
                        let result = utils.readConfig()
                        console.log("当前配置json", result)

                    } catch (error) {
                        console.warn("check your config, maybe it's missing".red)
                    }
                    break;
                default:
                    break;
            }

        })






    case "-files":
        console.log("config your paths...".yellow);
        console.log("paths format like this  /usr/abc/  or  c:/usr/abc ,not using '\\' ".yellow);
        utils.serialFiles().then((result) => {

            utils.writeFilesConfig(JSON.stringify(result))
        })

        break;

    case "-clear":
        console.log("clear all your settings");
        utils.select(["0.all clear", "1.clear ftp setting", "2.clear paths"], (answer) => {
            console.log("answer", answer[0])
            let result = answer[0];
            result = result.replace("\"", "");
            let order = result.split(".")[0];
            utils.clearConfig(order)
        })

        break;
    case undefined:
        /*         1.Local:可以是文件名，也可以是文件夹
        2.remote:必须是文件夹 */
        let config = {}
        config = utils.readConfig();
        console.log("config", config)

        let titleArray = []

        config.files.map(({
            local,
            remote,
            name
        }, i) => {
            titleArray.push(name.yellow + "=>" + local + "=>" + remote)
        })



        utils.select(titleArray, (files) => {
            uploadFiles(files, config.ftp)
        })

        break;
    default:
        break;
}



//0.配置上传路径
//1.Local:可以是文件名，也可以是文件夹
//2.remote:必须是文件夹
function uploadFiles(data, ftp) {
    console.log("uploadFiles", data)
    let local = data[0].split("=>")[1]
    let remote = data[0].split("=>")[2]

    utils.upload(ftp, {
        local,
        remote
    })


}