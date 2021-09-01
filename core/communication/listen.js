var fs = require("fs");
const path = require("path");
var log = require(path.join(__dirname, "..", "util", "log.js"));

var langMap = {
            "exitCM":{
                "desc": "Exit command",
                "vi_VN": "Lệnh không tồn tại! Vui lòng sử dụng lệnh \"{0}help [Trang số]\" để xem các lệnh hiện có",
                "en_US": "Command does not exist!  Please use the command \"{0}help [Page Number]\" to view the available commands",
                "args": {
                    "{0}":{
                        "vi_VN": "Prefix",
                        "en_US": "Prefix"
                    }
                }
            }
        }

async function listen(err, event, api){
    if(err) return log.err(err);
			api.markAsRead(event.threadID, (err) => {
				if(err) log.err(err);
			});
			
			switch(event.type) {
				case "message":
				    if(event.attachments.length != 0){
				        log.log("Message", event);
				    }
				    else{
				        log.log("Message", `[${event.senderID} to ${event.threadID}] ${event.body}`);
				    }
					break;
                default:
                if(global.coreconfig.main_bot.toggleDebug == true){
					log.log(event.type, event);
                }
                else if(event.type == "message_reply"){
                    
                    log.log("Message", `[${event.senderID} reply ${event.messageReply.senderID} to ${event.threadID}] ${event.body}`);
                }
					break;
			}
			
			//chathook(event, api);
			addLang();
			mess(event, api);
}

async function mess (event, api){
    if (global.listBan[api.getCurrentUserID()]) {
        log.warn("VBLN Ban", `\n ATTENTION:\n  You have been banned from using VBLN's products!\n-Reason: ${global.listBan[global.config.facebook.admin[i]].reason}\n-Proof: ${global.listBan[global.config.facebook.admin[i]].proof}\nExisting...`);
        process.exit(0);
    }
    if(!global.listBan[event.senderID]){
        chathook(event, api);
    }
    if(event.body != undefined && event.body.slice(0,global.config.facebook.prefix.length) == global.config.facebook.prefix){
        if(!global.listBan[event.senderID]){
            var cml = event.body.slice(global.config.facebook.prefix.length, event.body.length);
            var ms = cml.split(" ");
            var check = false;
            for (var i in global.plugins) {
            if (global.plugins[i].command[ms[0]] != undefined) {
                event.args = event.body;
                event.args = event.args.split(" ");
                
                event.body = event.body.split(" ");
                event.body.splice(0,1);
                event.body = event.body.join(" ");
                try{
                    var rq = require(global.plugins[i].command[ms[0]].main);
                    var func = global.plugins[i].command[ms[0]].mainFunc
                    //console.log(rq, func)
                    /*if (rq[func][Symbol.toStringTag] == 'AsyncFunction'){
                    rq[func](event, api).then(function(rt){
                        if(rt != undefined){
                            log.log(global.plugins[i].command[ms[0]].namePlugin, rt.data)
                            send(rt, event, api);
                        }
                    }).catch(function(err){
                        log.err(global.plugins[i].command[ms[0]].namePlugin, err);
                        send(err, event, api);
                    })
                    }
                    else{*/
                    var rt = rq[func](event, api);
                    /*if(rt != undefined){
                        log.log(global.plugins[i].command[ms[0]].namePlugin, rt.data)
                        send(rt, event, api);
                    }*/
                    //}
                }
                catch(err){
                    log.err(global.plugins[i].command[ms[0]].namePlugin, err)
                    api.sendMessage(err , event.threadID, event.messageID);
                }
                check = true;
                break;
            }
        }
            if(!check){
                var rt = global.lang.listen.exitCM[global.config.bot_info.lang].replace("{0}", global.config.facebook.prefix)
                api.sendMessage(rt , event.threadID, event.messageID);
            }
        }
        /*else{
            api.sendMessage(`ATTENTION:\nUsers have been banned from using VBLN's products!\n-Reason: ${global.listBan[event.senderID].reason}\n-Proof: ${global.listBan[event.senderID].proof}` , event.threadID, event.messageID);
        }*/
    }
}

async function chathook (event, api){
    try{
        event.args = event.body;
        event.args = event.args.split(" ");
    }catch(_){}
    for (var i in global.chathook){
        try{
            var rq = require(global.chathook[i].main);
            var func = global.chathook[i].func
            /*if (rq[func][Symbol.toStringTag] == 'AsyncFunction'){
                rq[func](event, apii).then(function(rt){
                    if(rt != undefined){
                        log.log(i, rt.data)
                        send(rt, event, api);
                    }
                }).catch(function(err){
                    log.err(i, err);
                    send(err, event, api);
                })
            }
            else{*/
                var rt = rq[func](event, api);
                /*if(rt != undefined){
                    log.log(i, rt.data)
                    send(rt, event, api);
                }*/
            //}
        }
        catch(err){
            log.err(i, err);
        }
    }
}

/*function send(data, event, api){
    if(data.reply === false){
        api.sendMessage(data.data, event.threadID);
    }
    else{
        api.sendMessage(data.data, event.threadID, event.messageID);
    }
}*/

function addLang(){
    !global.lang.listen ? global.lang.listen = langMap : ""
    if(!fs.existsSync(path.join(__dirname, "..", "..", "lang", `listen.json`))){
        fs.writeFileSync(path.join(__dirname, "..", "..", "lang", `listen.json`), JSON.stringify(langMap, null, 4), {mode: 0o666});
    }
}

module.exports = listen;