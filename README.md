artwise
=======

###SETUP PROJECT
```
npm install
npm install -g jasmine-node
```

Start server
```
node server
```

Application URL
```
http://localhost:5000
```

Start tests
```
jasmine-node .
```

###Add configuration for HTTP Requests
Create file `server/sources/config.yml`. Currently takes variables for requests to CI servers that provide a cctray.xml file, and Go CD servers.

Content:
```
default:
  gocd:
    user: xxx
    password: xxxx
    url: http://the-go-host:8153
    pipeline: <name of the pipeline you want to visualise>
  cc:
    user: xxx
    password: xxxx
    url: http://the-ci-host/<location of cctray.xml/cctray.xml
```

Also supports Heroku config vars instead of these config files:

```
GOCD_USER
GOCD_PASSWORD
GOCD_URL
GOCD_PIPELINE

CC_USER
CC_PASSWORD
CC_URL
```

###Add credentials for contextIO email reader
Create file `server/sources/email/contextio.yml`

Content:
```
default:
  contextIo:
    key: xxx
    secret: xxxx
```
