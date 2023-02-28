# ⚠️ Forewarning ⚠️ 
You are responsible for what you do on your twitch account, use these overrides with caution. I am not responsible for any account terminations which may occur from this tool.

## Twitch Experiments
A tool which allows you to generate a cookie to override experiments on the twitch website.

This tool redownloads the settings file every day. Not all experiments do anything - it's probably for the best if you only enable the ones you would like to use. 

### How to Use
Just select the experiment buckets you want then copy the cookie to the appropriate location.

Twitch's experiment parser also uses window search parameters so that's also an alternative.

### How to build
Take a look at the CI, basically

1. Clone the project 
2. Run npm install
3. Run npm start when ready.

### Forking
By default, the github action will not automatically run on any forks. This is intentional to prevent unwanted branch updates.

The action can still be run manually, or the condition in the action can be removed if you would like your fork to run the job daily - just be aware of the quotas on your account! 
