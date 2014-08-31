artwise
=======

###SETUP PROJECT
```
npm install
```

Start server
```
node app
```

Application URL
```
http://localhost:5000
```

###Add configuration for HTTP Requests
Create file `server/sources/config.yml`. Currently takes variables for requests to CI servers that provide a cctray.xml file, and Go CD servers.

Content:
```
default:
  gocd:
    url: http://the-go-host:8153
    pipeline: <name of the pipeline you want to visualise>
    user: xxx
    password: xxxx
  cc:
    url: http://the-ci-host/<location of cctray.xml/cctray.xml
    user: xxx
    password: xxxx
```

If you just want to see what it looks like, setting url values to 'fake-it' will load some static fixtures to give you an idea:
```
default:
  gocd:
    url: fake-it
  cc:
    url: fake-it
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


Run tests
```
sh ./run_spec.sh
```