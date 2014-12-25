artwise
=======

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

### Why so MANY colors and figures?

Green and red, and one figure each for pass and failed would be enough, right? But that would be boring and not look very "Haring like"...

The idea is to show high level information at a glance, and more details if you need them. Yes, first you'll have to figure out and explain what it all means, but usage shows that it's easy to remember afterwards.

And the most important piece of information is very easy to see, by the way: The last run's status is depicted by the background color, good ol' red and green.

### Need more details?

Click the view to toggle through two different info modes.

![Info modes](designs/haring/info_modes.png?raw=true "Info modes")

##SETUP PROJECT
```
npm install
```

Run tests
```
sh ./run_spec.sh
```

Configure access to your Go CD server (see below)

Start server
```
node server
```

Local application URL
```
http://localhost:5000
```

##Configuration
Create file `config.yml` in the root of the project and configure as described below.

###Location and access to Go CD
```
default:
  gocd:
    url: the-go-host:8153
    pipeline: <name of the pipeline you want to visualise>
    user: xxx
    password: xxxx
```

If you just want to see an example, without connecting to a server yet, setting 'sample' to true will load some static fixtures to give you an idea:
```
default:
  gocd:
    sample: true
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

##Run on Heroku
For each value in the config file, you can create a respective Heroku variable so you won't have to push config.yml to the git repository.

```
heroku config:set GOCD_URL=the-go-host:8153
heroku config:set GOCD_PIPELINE=my-pipeline
heroku config:set GOCD_USER=xxx
heroku config:set GOCD_PASSWORD=xxx
heroku config:set GOCD_JOBS="my-pipeline :: build,my-pipeline :: integration-test,my-pipeline :: deploy"
```
