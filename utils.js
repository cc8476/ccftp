const ipt = require("ipt");
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const fs = require('fs');

const cFILES=__dirname+'/files.json';
const cCONFIG=__dirname+'/sftp.json';


//清除配置
function clearConfig(order) {
    console.log("order",order,fs)
    switch (Number(order)) {
        case 0:
            fs.unlinkSync(cCONFIG);
            fs.unlinkSync(cFILES);
            break;
        case 1:
            fs.unlinkSync(cCONFIG);
            break;
        case 2:
            fs.unlinkSync(cFILES);
            break;
        default:
            break;
    }
}


//读取配置
function readConfig() {

    let config = {}
    let data = fs.readFileSync(cCONFIG, "utf-8")
    config['ftp'] = JSON.parse(data);

    let dataFiles = fs.readFileSync(cFILES, "utf-8")

    dataFiles = dataFiles.split('\n')
    dataFiles = dataFiles.map((single) => {
        if (single) {
            return JSON.parse(single)
        }
    })


    config['files'] = dataFiles
    return config;
}


//ftp配置保存进文件
function writeFTPConfig(json) {
    fs.writeFile(cCONFIG, json, {
        flag: 'w+'
    }, (err) => {
        if (err) throw err;
        console.log('sftp.json is saved'.green);
        process.exit(0);
    });
}


function upload({
    host,
    port,
    username,
    privateKey,
    password
}, {
    remote,
    local
}) {

    let Client = require('ssh2-sftp-client');
    let sftp = new Client();

    let connectObj = {
        host,
        port,
        username,
        privateKey,
        password
    }

    for (const key in connectObj) {
        if(connectObj[key]=='' || !connectObj[key]) {
            delete connectObj[key];
        }
        else {
            if(key=='privateKey') {
                connectObj[key] = fs.readFileSync(connectObj[key])
            }
/*             if(key=='name') {
                connectObj["username"] = connectObj[key]
            } */
        }
    }

    sftp.connect(connectObj).then(data => {
        console.log('the data info:connected');

        sftp.put(local, remote).then(() => {
            console.log("upload done!".green)
            process.exit(0);

        }).catch((e) => {
            console.log("catch", e)
            process.exit(0);
        })


    }).catch(err => {
        console.log(err, 'catch error');
        process.exit(0);
    });
}


//上传路径配置保存进文件
function writeFilesConfig(json) {

    try {
        fs.readFileSync(cFILES, "utf-8")
        json = '\n' + json;
    } catch (error) {

    }

    fs.writeFile(cFILES, json, {
        flag: 'a+'
    }, (err) => {
        if (err) throw err;
        console.log('files.json is saved'.green);
        process.exit(0);
    });
}


//选择框函数:标题和回调函数对应
function select(titleArray, callback) {

    ipt(titleArray, {})
        .then(key => {
            callback(key);
        })
}




//配置host函数，输出host,port,name,privateKey等数据
function serialFtp() {
    let ftpConfig = {}
    return question("host", ftpConfig).then(
        (answer) => {
            return question("port", ftpConfig)
        }
    ).then(
        (answer) => {
            return question("username", ftpConfig)
        }
    ).then(
        (answer) => {
            return question("password", ftpConfig,"","write your passport or you can choose privateKey path")
        }
    ).then(
        (answer) => {
            return question("privateKey", ftpConfig,"","write your privateKey path")
        }
    ).then(
        (answer) => {
            rl.close()
            return Promise.resolve(ftpConfig);
        }
    )
}

//配置host函数，输出host,port,name,privateKey等数据
function serialFiles() {
    let ftpConfig = {}
    return question("name", ftpConfig).
    then(
        (answer) => {
            return question("local", ftpConfig)
        }
    ).
    then(
        (answer) => {
            let tempArr = answer.split("/")
            let addtional = tempArr[tempArr.length - 1]
            return question("remote", ftpConfig, addtional)
        }
    ).then(
        (answer) => {
            rl.close()
            return Promise.resolve(ftpConfig);
        }
    )
}


function question(title, ftpConfig, addtional="",addtionalTitle="") {
    return new Promise((resolve) => {
        let otherTitle = addtionalTitle?"["+addtionalTitle+"]":""
        rl.question(title +otherTitle.green+ "==>", answer => {
            if (addtional) {
                answer = answer + addtional
            }

           // answer = answer.replace("\",)
            ftpConfig[title] = answer;
            resolve(answer)
        });
    })
}


let utils = {
    select,
    serialFtp,
    writeFTPConfig,
    writeFilesConfig,
    serialFiles,
    readConfig,
    upload,
    clearConfig
}
module.exports = utils;