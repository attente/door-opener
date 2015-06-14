/*
 * Copyright (c) 2015 William Hua
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Except as contained in this notice, the names of the authors or copyright
 * holders shall not be used in advertising or otherwise to promote the sale,
 * use or other dealings in this Software without prior written authorization
 * from them.
 */

var DEFAULT = {
  base: 'http://domain.com/',
  port: 3000,
  uri: '/door',
  auri: '/hello',
  size: 1000,
  audio: 'hello.wav',
  atype: 'audio/wav',
  pin: '1234',
  open: '9',
};

var minimist = require('minimist');
var fs = require('fs');
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var twilio = require('twilio');

var argv = minimist(process.argv.slice(2), {
  string: [
    'base',
    'uri',
    'auri',
    'audio',
    'atype',
    'pin',
    'open',
    'account',
    'from',
  ],
  alias: {
    base: 'b',
    port: 'p',
    uri: 'u',
    auri: 'a',
    size: 'n',
    audio: 'A',
    atype: 'T',
    pin: 'P',
    open: 'O',
  },
  unknown: function (arg) {
    return arg in [
      'base',
      'port',
      'uri',
      'auri',
      'size',
      'audio',
      'atype',
      'pin',
      'open',
      'account',
      'from',
    ];
  },
  default: DEFAULT,
});

var clip = fs.readFileSync(argv.audio);

var server = http.createServer();

server.on('request', function (request, response) {
  var parsed = url.parse(request.url, true);

  if (parsed.pathname === argv.auri) {
    return reply(200, { 'Content-Type': argv.atype }, clip);
  }

  if (parsed.pathname !== argv.uri) {
    return reply(404);
  }

  switch (request.method) {
    case 'GET':
      process(parsed.query);
      break;

    case 'POST':
      var query = '';

      request.on('data', function (chunk) {
        query += chunk;

        if (query.length > argv.size) {
          reply(413);
          request.socket.destroy();
        }
      });
      request.on('end', function () {
        process(querystring.parse(query));
      });

      break;

    default:
      reply(405, { Allow: 'GET, POST' });
      return;
  }

  function process(parameters) {
    var markup = new twilio.TwimlResponse();

    function ignore() {
      markup.reject();
    }

    function welcome() {
      markup.play(url.resolve(argv.base, argv.auri));
      markup.gather();
      markup.hangup();
    }

    function open() {
      markup.play({ digits: argv.open });
      markup.hangup();
    }

    var account = !('account' in argv) || parameters.AccountSid === argv.account;
    var from = !('from' in argv) || parameters.From === argv.from;
    var accept = account && from;

    if (accept) {
      if (!('Digits' in parameters)) {
        welcome();
      } else {
        if (parameters.Digits === argv.pin) {
          open();
        } else {
          welcome();
        }
      }
    } else {
      ignore();
    }

    reply(200, { 'Content-Type': 'application/xml; charset=utf-8' }, markup.toString());
  }

  function reply(status, override, body) {
    var headers = { 'Content-Type': 'text/html; charset=utf-8' };

    if (body)
      headers['Content-Length'] = body.length;

    for (var key in override) {
      headers[key] = override[key];
    }

    response.writeHead(status, headers);
    response.end(body);
  }
});

server.listen(argv.port);
