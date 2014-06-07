artwise
=======

###TOOLS SETUP

1.) Git Repo

git clone https://github.com/susannekaiser/artwise.git

2.) Install nodejs on Linux

sudo apt-get update
sudo apt-get install python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs


###SETUP PROJECT
```
cd artwise
npm install
npm install -g karma-cli
```

Start server
`node server.js`

Access application
`localhost:5000/app/index.html'

Start tests
`karma start`

###To run tests
`npm install -g karma karma-cli`
`karma start`

###Add credentials for contextIO
Create file `artwise/server/contextio.yml`

Content:
```
default:
  contextIo:
    key: xxx
    secret: xxxx
```
