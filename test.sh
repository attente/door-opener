#!/bin/sh
#
# Copyright (c) 2015 William Hua
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
# Except as contained in this notice, the names of the authors or copyright
# holders shall not be used in advertising or otherwise to promote the sale, use
# or other dealings in this Software without prior written authorization from
# them.

node main.js -b http://localhost -p 3001 -u /door -a /hello -A hello.wav -P 1234 -O 9 &

PID=$!

sleep 1

echo GET /door
curl http://localhost:3001/door
echo
echo
echo POST /door
curl -X POST http://localhost:3001/door
echo
echo
echo GET /door?Digits=1234
curl http://localhost:3001/door?Digits=1234
echo
echo
echo POST /door Digits=1234
curl -X POST http://localhost:3001/door -d Digits=1234
echo
echo
echo GET /door?Digits=1235
curl http://localhost:3001/door?Digits=1235
echo
echo
echo POST /door Digits=1235
curl -X POST http://localhost:3001/door -d Digits=1235
echo
echo
echo GET /hello
curl -D - -s http://localhost:3001/hello | head -n 6
echo POST /hello
curl -D - -s -X POST http://localhost:3001/hello | head -n 6
echo GET /not/found
curl -D - http://localhost:3001/not/found
echo POST /not/found
curl -D - -X POST http://localhost:3001/not/found
echo PUT /door
curl -D - -X PUT http://localhost:3001/door

kill $!
