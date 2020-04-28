# Discord Bot

## About:
Made as a side project for me and my friends during my first steps in JavaScript. Made using [Discord.js](https://discord.js.org/#/). Ready to be deployed on Heroku. Most of the functionality is based on Riot Games API.

## Funcionality:
- **Link shortening**:
    type `$shorten <link>` to get shortened link from server.
- **Summoner data**:
    type `$summoner <summoner name>` to get data about current division/rank etc.
- **Live game**:
    type `$livegame <summoner name>` to check if the player is currently playing and for how long.
- **Last game**:
    type `$lastgame <summoner name>` to get data about summoner's last game.
- **Last seen**:
    type `$seen @<mention user>` to check when was the last time he performed action on the voice channel. It also saves how many minutes user was connected to the channel.
- **Ranking**:
    type `$ranking` connected with last seen. Displays current ranking of most active (who is most often logged in) users.
- **Corona**:
    type `$corona <country name>` to check current statistics about this country.
- **More still in development...**

## Install:
- You have to get your own API key from RIOT GAMES. Get one [here](https://developer.riotgames.com/).
- For the `corona` functionality you have to get API key from RAPID API.
- Data saving uses Google Sheets API.
- [Heroku](https://www.heroku.com) is a good option to deploy this. Provide api keys and prefix as a config var in Heroku dashboard.
