artwise
=======
[![Build Status](https://snap-ci.com/artwise/artwise/branch/master/build_image)](https://snap-ci.com/artwise/artwise/branch/master)

Build Monitor for [Go CD](http://go.cd).

Loosely based on the idea of [Informative Art](http://www.cse.chalmers.se/research/group/idc/ituniv/kurser/07/idproj/papers/p103-redstrom.pdf).

Tested in Chrome and Chromium (works in Firefox, too, but has some layouting quirks).

## Keith Haring style

Figures with dotted borders show activity of stages in the current/latest pipeline run, all others represent
the history of runs. Colors and types of figures represent failed and passing builds, background color indicates status
of latest pipeline run (passed, failed or currently building).


![All passing](designs/haring/sample_passed.png?raw=true "All good")

![Failure](designs/haring/sample_failed.png?raw=true "Failure")

![Building](designs/haring/sample_building.png?raw=true "Currently building")

### Need more details?

Click the view to toggle through two different info modes.

![Info modes](designs/haring/info_modes.png?raw=true "Info modes")

### What else?
Has a few little surprises in stock, like using the grid as a bingo board, or keeping track of a green streak.

##SETUP PROJECT
```
npm install
```

Run tests
```
npm test
```

Configure access to your Go CD server (see below)

Start server
```
node server
```

Local application URL
```
http://localhost:5000/haring/?pipeline=name-of-pipeline-to-display
```

##Configure and host yourself
Create file `config.yml` in the root of the project and configure as described below.

###Access to Go CD
```
default:
  gocd:
    url: https://the-go-host:8154
    user: xxx
    password: xxxx
    timeDiff: -60    # (in minutes) if the Go server is in a different time zone than where artwise server is running
```

###Filter the jobs to show from CC Tray activity
By default, all jobs from CC Tray's activity feed will be displayed. You can restrict that by providing a list of jobs. The application will use the strings in that list to check if a job name STARTS WITH that.
```
default:
  gocd:
    ...
    jobs:
      - 'my-pipeline :: build'
      - 'my-pipeline :: integration-test'
      - 'my-pipeline :: deploy'
```
###Haring visualization
```
default:
  haring:
    dangerZones:
      - '17:50-23:00'
    acceptableTimeFailed: 30
```
'dangerZones' (optional) are time slots in 24-hour format. If you trigger a build at these times, you will get a visual indicator that maybe now is not a good time to build.

'acceptableTimeFailed' (optional, default is 30) is the number of minutes that is acceptable for a build to stay red. When that period is up, there will be a visual indicator that it is.

### Run with SSL
You can run the artwise server with SSL support. The server will look for these two files and use them if they exist:
```
artwise-csr.pem
artwise-key.pem
```
Here is one resource to help you get started with a self-signed certificate:
[https://nodejs.org/api/tls.html#tls_tls_ssl](https://nodejs.org/api/tls.html#tls_tls_ssl)

...and then check it out at `https://localhost:5000/haring/`.

##Configure and run on Heroku
For each value in the config file, you can create a respective Heroku variable so you won't have to push config.yml to the git repository.

Please note that you can access the deployed Heroku instance via HTTPS out of the box, you will not have to create your own certificate etc.

### Step by step
- Create a new application in Heroku and make a note of its Git repository address.
- Install the [Heroku Toolbelt](https://toolbelt.heroku.com).

```
# Clone artwise
git clone https://github.com/artwise/artwise.git

# Add your Heroku repository as a remote
cd artwise
git remote add heroku git@heroku.com:your-repo-name.git

# Configure access
heroku config:set GOCD_URL=the-go-host:8153
heroku config:set GOCD_USER=xxx
heroku config:set GOCD_PASSWORD=xxx
heroku config:set GOCD_JOBS="my-pipeline :: build,my-pipeline :: integration-test,my-pipeline :: deploy"

# Configure haring settings (optional)
heroku config:set HARING_DANGERZONES="17:50-23:00"
heroku config:set HARING_ACCEPTABLETIMEFAILED="60"

# Deploy code
git push heroku master

```
