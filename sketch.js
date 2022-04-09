// MQTT client details:
let broker = {
    hostname: 'public.cloud.shiftr.io',
    port: 443
};

// MQTT client:
let client;

let creds = {
    clientID: 'p5Client',
    userName: 'public',
    password: 'public'
}

let topic = 'fungi';
var send_data = "Hello";


//----
let personalID;
let linkList = [];
let bgcList = ['orangered', 'chartreuse', 'gold'];
let bgc = 230;


//----
let input1, input2;
let button1, button2;
let greeting;
let linkLiskPreview;
let msgSend, msgGet;


//----
let changeBgc_gotMsg = false;
let changeCountDown = 0;



//--------------------------------------------------------
function setup() {

    var canva = createCanvas(windowWidth, 220);
    background(0);
    canva.drop(gotFile); // .drop(上傳完批次處理檔案的函式,放開瞬間會發生的事)

    // Create an MQTT client:
    client = new Paho.MQTT.Client(broker.hostname, broker.port, creds.clientID);
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // connect to the MQTT broker:
    client.connect({
        onSuccess: onConnect, // callback function for when you connect
        userName: creds.userName, // username
        password: creds.password, // password
        //useSSL: true // use SSL
        useSSL: true
    });

    input1 = createInput();
    input1.position(20, 65);
    button1 = createButton('submit');
    button1.position(input1.x + input1.width, 65);
    button1.mousePressed(greet);

    greeting = createElement('h2', 'what is your id?');
    greeting.position(20, 5);

    linkLiskPreview = createElement('h4', '');
    linkLiskPreview.position(20, 80);
    msgSend = createElement('h4', '');
    msgSend.position(20, 110);
    msgGet = createElement('h4', '');
    msgGet.position(20, 140);


    textAlign(CENTER);
    textSize(50);


}

function draw() {

    background(bgc);

    if (changeBgc_gotMsg) {
        background(200);
        changeCountDown++;
        if (changeCountDown > 60) changeBgc_gotMsg = false;
    }
    // sendMqttMessage(send_data);
    // console.log(send_data);
}

function greet() {
    personalID = input1.value();
    greeting.html('hello fungi/' + personalID + ', start linking!');
    bgc = bgcList[int(personalID - 1)];

    input1.value('');
    input1.hide();
    button1.hide();

    input2 = createInput();
    input2.position(20, 65);
    button2 = createButton('link');
    button2.position(input2.x + input2.width, 65);
    button2.mousePressed(createKink);


    let subscribeTopic = topic + "/" + personalID;
    client.subscribe(subscribeTopic)
}


function createKink() {
    let linkId = input2.value();
    linkList.push(topic + "/" + linkId);
    // console.log(linkList);
    input2.value('');
    console.log("linkList: " + linkList);

    linkLiskPreview.html("linkList: " + linkList);
}

function gotFile(file) {
    createP("upload file: " + file.name + " " + file.type + " " + file.size);
    //var img = createImg(file.data);
    //img.hide();
    //image(img, 0, 0, 400, 200)
    let target = linkList[Math.floor(Math.random() * linkList.length)];
    let msg = '{"file": ' + file.name + ',\n"Author": ' + topic + "/" + personalID + '}';
    console.log("send msg: " + msg);
    console.log("to target: " + target);
    sendMqttMessage(msg, target);
    msgSend.html("send msg: " + msg + "---" + "to target: " + target);


}

// called when the client connects
function onConnect() {
    console.log('client is connected');
    // client.subscribe(topic);
}


// called when the client loses its connection
function onConnectionLost(response) {
    if (response.errorCode !== 0) console.log('onConnectionLost:' + response.errorMessage);
}

// called when a message arrives
function onMessageArrived(message) {
    console.log('I got a message:' + message.payloadString);
    msgGet.html('I got a message:' + message.payloadString);
    createP("got msg:" + message.payloadString);

    changeBgc_gotMsg = true;
    changeCountDown = 0;
}

// called when you want to send a message:
function sendMqttMessage(msg, targetTopic) {
    // if the client is connected to the MQTT broker:
    if (client.isConnected()) {
        // start an MQTT message:
        message = new Paho.MQTT.Message(msg);
        // choose the destination topic:
        // message.destinationName = topic;
        message.destinationName = targetTopic;
        // send it:
        client.send(message);
        // print what you sent:
        //console.log('I sent: ' + message.payloadString);
    }
}