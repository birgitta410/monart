artwise
=======

###SETUP PROJECT
```
npm install
npm install -g karma-cli
```

Start server
`node server`

Application URL
`http://localhost:5000'

Start tests
`karma start`


###Add credentials for contextIO email reader
Create file `server/sources/email/contextio.yml`

Content:
```
default:
  contextIo:
    key: xxx
    secret: xxxx
```
