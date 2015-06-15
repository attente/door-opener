# door-opener

A small Twilio app for a phone number that can be used to answer calls from a
building's intercom system. It opens the door if the person knows the correct
PIN.

## setup

### install dependencies

`npm install minimist fs http url querystring twilio`

### edit defaults

`vi main.js`

## run

```
node main.js [options]

  --base,-b <url>       base URL, e.g. http://domain.com/
  --port,-p <port>      listening port, e.g. 3000
  --uri,-u <uri>        application endpoint, e.g. /door
  --auri,-a <uri>       audio message endpoint, e.g. /hello
  --size,-n <size>      maximum request size, e.g. 1000
  --audio,-A <path>     audio file, e.g. hello.wav
  --atype,-T <type>     audio file MIME type, e.g. audio/wav
  --pin,-P <digits>     passcode, e.g. 1234
  --open,-O <digits>    door open, e.g. 9
  --account <id>        Twilio account, e.g. AC012...def
  --from <phone>        caller, e.g. +15555555555
```
