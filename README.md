# *Nodejs Server API*

## Prerequisites

* **Node.js v0.8.x** - Download and Install [Node.js](http://www.nodejs.org/download/).

* **NPM** - Node.js package manager, should be automatically installed when you get node.js.

* **MongoDB**  Download and Install [MongoDB] (https://docs.mongodb.com/manual/administration/install-community/).

## Mongodb api data
  
  Necessary for basic authentication

  db.oauthclients.insert( { "client_id" : "49a99791-290a-4c47-a66f-af20fd4d8193",  "client_secret" : "b4a65921-8d6b-405b-a1da-a864f0c67ef5", "redirect_uri" : "http://localhost/cb" } ) 

  You must change (client_id and client_secret) attributes for those of your site

## Quick Install
  Check the Prerequisites section above before installing.

  Clone the main repository:

    $ git clone https://github.com/jestevez/nodejs-server-api.git && cd nodejs-server-api

  Install dependencies:

    $ npm install

  Run the main application:

    $ node insight.js

  Then open a browser and go to:

    http://localhost:3001

## Configuration

All configuration is specified in the [config](config/) folder, particularly the [config.js](config/config.js) file. There you can specify your application name and database name. Certain configuration values are pulled from environment variables if they are defined:

```
MONGODB_URL           # Mongo db url connection like "mongodb://localhost:27017/miapidb"
API_PREFIX            # Prefix api default "/api"
PORT                  # Http port default 3000
ENABLE_HTTPS          # Enable https
SMTP_HOST             # Smtp server like "smtp.gmail.com"
SMTP_SERVICE          # Smtp service like "gmail"
SMTP_USER             # Smtp user
SMTP_PASSWORD         # Smtp password
LOGGER_LEVEL          # Log level default info, (debug, info, error)
DEBUG                 # Debug name default nodejs-server-api 
```
## API

By default, provides a REST API at `/api`, but this prefix is configurable from the env var `API_PREFIX` or directly in the `config.js` file.

 Check this link ( http://localhost:3000/api/version) to see if the api is running

## Postman 

Use Postman to test endpoint https://www.getpostman.com/collections/5579c455733056cc4e9b

## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
