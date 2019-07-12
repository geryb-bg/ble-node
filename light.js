const bleno = require("bleno");
const raspi = require('raspi-io');
const five = require('johnny-five');

//johnny-five
const board = new five.Board({
    io: new raspi()
});
let leds;
board.on('ready', () => {
    leds = new five.Leds(['P1-13']);
});

//bleno
const LED_SERVICE_UUID = "00010000-89BD-43C8-9231-40F6E305F96D";
const LED_CHAR_UUID = "00010001-89BD-43C8-9231-40F6E305F96D";

class LedCharacteristic extends bleno.Characteristic {
    constructor(uuid, name) {
        super({
            uuid: uuid,
            properties: ["write"],
            value: null,
            descriptors: [
                new bleno.Descriptor({
                    uuid: "2901",
                    value: name
                })
            ]
        });

        this.argument = 0;
        this.name = name;
    }

    onWriteRequest(data, offset, withoutResponse, callback) {
        try {
            if (data.length != 1) {
                callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
                return;
            }

            this.argument = data.readUInt8();
            console.log(`Argument ${this.name} is now ${this.argument}`);
            leds[this.argument].toggle();
            callback(this.RESULT_SUCCESS);
        } catch (err) {
            console.error(err);
            callback(this.RESULT_UNLIKELY_ERROR);
        }
    }
}

console.log("Starting bleno...");

bleno.on("stateChange", state => {

    if (state === "poweredOn") {
        
        bleno.startAdvertising("LEDBlink", [LED_SERVICE_UUID], err => {
            if (err) console.log(err);
        });

    } else {
        console.log("Stopping...");
        bleno.stopAdvertising();
    }        
});

bleno.on("advertisingStart", err => {

    console.log("Configuring services...");
    
    if(err) {
        console.error(err);
        return;
    }

    let ledchar = new LedCharacteristic(LED_CHAR_UUID, "LED");

    let ledService = new bleno.PrimaryService({
        uuid: LED_SERVICE_UUID,
        characteristics: [
            ledchar
        ]
    });

    bleno.setServices([ledService], err => {
        if(err)
            console.log(err);
        else
            console.log("Services configured");
    });
});


// some diagnostics 
bleno.on("stateChange", state => console.log(`Bleno: Adapter changed state to ${state}`));

bleno.on("advertisingStart", err => console.log("Bleno: advertisingStart"));
bleno.on("advertisingStartError", err => console.log("Bleno: advertisingStartError"));
bleno.on("advertisingStop", err => console.log("Bleno: advertisingStop"));

bleno.on("servicesSet", err => console.log("Bleno: servicesSet"));
bleno.on("servicesSetError", err => console.log("Bleno: servicesSetError"));

bleno.on("accept", clientAddress => console.log(`Bleno: accept ${clientAddress}`));
bleno.on("disconnect", clientAddress => console.log(`Bleno: disconnect ${clientAddress}`));