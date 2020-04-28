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
- **Coronavirus statistics**:
    type `$corona <country name>` to check recent stats about Coronavirus in this country.
- **More still in development...**

## Install:
It was made for personal use but if you would like to use it go on. Some of the functionality is hard coded so it needs to be changed.

Apart from that you also:
- You have to get your own API key from RIOT GAMES. Get one [here](https://developer.riotgames.com/).
- Data saving uses Google Sheets API.
- For the `corona` functionality you need [this API key](https://rapidapi.com/api-sports/api/covid-193/endpoints).
- [Heroku](https://www.heroku.com) is a good option to deploy this. Provide api keys and prefix as a config var in Heroku dashboard.
