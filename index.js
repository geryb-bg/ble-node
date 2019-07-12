var noble = require('noble');
var counter = 0;

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning([], true);
        noble.on('discover', function(peripheral) { 
            
            var macAdress = peripheral.uuid;

            if (macAdress == "97d781f24f2045fd8d76a945deb6a007") {
                counter++;
                var rss = peripheral.rssi;
                var localName = peripheral.advertisement.localName; 
                console.log(counter + ". Mac Address: " + macAdress + ", RSS: " + rss + ", Local Name: " + localName);   
            }
        });
    }
    else
      noble.stopScanning();
});

