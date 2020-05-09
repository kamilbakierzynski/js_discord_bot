# Instalation guide

# 1. Discord Key
Go to https://discord.com/developers and register your bot. Get secret KEY and type it into the .env file (delete .example from name) in field BOT_TOKEN.

# 2. Riot Api Key
Go to https://developer.riotgames.com/ and register. It's best to obtain the personal production key. But if you don't have one use the developer key. You will have to refresh it once in every 24h. Fill the RIOT_API_KEY in .env file.

# 3. Prefix
Choose prefix for your bot and specify it in the config.json as a string for prefix field.

# 4. Google Sheet DB
Upload attached file to your account. Take the spreadsheet id and fill the SPREADSHEET_ID field in .env file. Go to https://console.developers.google.com/ create new project and then enable Google Sheet API. Create new Login Data. Choose account and server based. When you are done get the email of a newly created user and add with edit permissions to your Google Spreadsheet.

# 5. Rapid Api Key
Register here https://rapidapi.com/, get your key, fill the RAPID_API_KEY field in .env file and then subscripe to this API https://rapidapi.com/api-sports/api/covid-193/endpoints.

# 6. Config file
Open config.json and change all values to ones from your server. To get the channel id etc. go to Discord settings => enable Developer mode and then rightclick on channel => Copy channel ID. Change all setings for your own.

# 6. Heroku Deployment
Clone/Fork the repo, make changes and then upload to your personal GitHub account or straight to Heroku account. In settings add environment variables form .env file.

If you have any problems please file an issue.
