## DebateGPT Experimental Platform

This folder contains the code to recreate the experimental platform (development-mode only) used in the paper to have people debate synchronously with other participants or with LLMs. The platform is built on top of [Empirica](https://empirica.ly/), a framework for building interactive experiments.

### Development requirements

1. Install Empirica
```bash
curl https://install.empirica.dev | sh
```

2. Install required dependencies
```bash
empirica upgrade
```

### Running Empirica (development)

1. Run development server
```bash
./entrypoint_dev.sh
```

2. Open the browser at `http://localhost:3000/admin` to see the admin console.

3. Click on "Create batch" and select the "Custom" assignment mode, pasting the following configuration: 
```json
{
    "name": "test",
    "custom": true,
    "topicsPath": "../selected_topics.json",
    "treatmentsPath": "../.empirica/treatments.yaml",
    "launchDate": 300000,
    "lobbyConfig": {
      "name": "Default shared fail",
      "kind": "shared",
      "duration": 300000000000,
      "strategy": "fail"
    }
}
```
Alternatively, for test purposes, you can directly create one or more games of one specific treatment condition, using the "Complete" assignment mode. In that case, the countdown step is skipped, and people are assigned to games as soon as they complete the intro steps.

4. Open the browser at `http://localhost:3000/` to see the experiment from the participant's perspective. You can use the buttons on the bottom left of your screen to reset your session or add another participants in a different tab.
