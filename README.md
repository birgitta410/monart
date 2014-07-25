artwise
=======

###SETUP PROJECT
```
npm install
npm install -g jasmine-node
```

Start server
`node server`

Application URL
`http://localhost:5000'

Start tests
`jasmine-node . --autotest`

###Add configuration for a Go CD server
Create file `server/sources/gocd/gocd.yml`

Content:
```
default:
  gocd:
    user: xxx
    password: xxxx
    url: http://the-go-host:8153
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
