## !!! DO NOT ABUSE DISCORD WEBHOOKS !!!
## !!! DO NOT SEND EVENT LOGS TO DISCORD !!!

## rdprxy

This is an open source proxy for Roblox HttpService requests. It works with any domain but was made specifically to proxy Roblox api requests and discord webhook requests from in-game. This will proxy headers, cookies, paths, or whatever else you throw of it. It is configured so that only you can use it and other people can't abuse your proxy for themselves.

**DO NOT ABUSE DISCORD WEBHOOKS**. This proxy is for _legitimate users_ of those webhooks who need a quick solution.

This is the only project I've made where I am not asking you have any experience to set up the server. That is because I have made the setup process easy enough for anyone to do it. Now, listen closely and pay attention while I describe the setup process for you.

**Setup**

- Click this button

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

- Create an account if you need to. Once you're done, come back and click the button again. Login if you need to.
- Type in whatever name you want.
- Click "Deploy app".
- Click view and copy the URL.
- Click manage app and go to `Settings > Reveal Config Vars` and copy the ACCESS_KEY.

That's it.

**Please**

Seriously, this is so easy nobody can possibly screw it up. If you somehow do... I don't even know.

**Client**

Now you can get the handler script from [here](https://github.com/sentanos/rdprxy/blob/master/client/proxyHandler.mod.lua) and put it in a module script in ServerScriptService. Here is the API:

    ProxyHandler:New(domain, accessKey)
    Proxy:Get(target, path, nocache, headers)
    Proxy:Post(target, path, data, contentType, compress, headers)

Domain is the domain of your heroku application including the http:// or https://. _Do not_ include a slash at the end of the domain.

It is exactly the same as HttpService.GetAsync and HttpService.PostAsync _except_ the first argument is the hostname (eg. `api.roblox.com` or `discordapp.com`) and the second argument is the path (eg. `/users/2470023`)

Example:

    local ProxyHandler = require(script.Parent.ProxyHandler)
    local Proxy = ProxyHandler:New('https://rdprxy-test.herokuapp.com', '6ddea1d2a6606f01538e8c92bbf8ba1e9c6aaa46e0a24cb0ce32ef0444130d07')

    print(Proxy:Get('api.roblox.com', '/users/2470023'))

Feel free to look in the module and just use HttpService (the module just attaches a couple headers).

**I'm serious**

## !!! DO NOT ABUSE DISCORD WEBHOOKS !!!
## !!! DO NOT SEND EVENT LOGS TO DISCORD !!!

This is why Roblox was blocked from discord in the first place. If you use this responsibly Discord will neither know you are requesting from Roblox or care that you are using it.
