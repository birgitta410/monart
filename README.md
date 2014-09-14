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

###Add configuration for Go CD and CC tray
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

If you just want to see what it looks like, setting 'fake' to true will load some static fixtures to give you an idea:
```
default:
  gocd:
    fake: true
  cc:
    fake: true
```

###Configure the jobs to show from CC Tray activity
By default, all jobs from CC Tray's activity feed will be displayed. You can restrict that by providing a list of jobs. The application will use the strings in that list to check if a job name STARTS WITH that.
```
default:
  cc:
    fake: true
    jobs:
      - 'A-PIPELINE :: build'
      - 'A-PIPELINE :: integration-test'
      - 'A-PIPELINE :: deploy-dev'
```


Also supports Heroku config vars instead of the config files (`heroku config:set GOCD_PIPELINE=mypipeline`).

```
GOCD_USER
GOCD_PASSWORD
GOCD_URL
GOCD_PIPELINE

CC_USER
CC_PASSWORD
CC_URL
CC_JOBS
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