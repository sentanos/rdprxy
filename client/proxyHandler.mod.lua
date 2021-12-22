script = nil

local http = game:GetService('HttpService')
local httpGet = http.GetAsync
local httpPost = http.PostAsync
local httpRequest = http.RequestAsync

local ProxyHandler = {}

function ProxyHandler:New(host, accessKey)
	self.host = host
	self.accessKey = accessKey
	return self
end

function ProxyHandler:Get(target, path, nocache, headers)
	local sendHeaders = headers or {}
	sendHeaders['Proxy-Access-Key'] = self.accessKey
	sendHeaders['Proxy-Target'] = target
	return httpGet(http, self.host .. '/' .. path, nocache, sendHeaders)
end

function ProxyHandler:Post(target, path, data, contentType, compress, headers)
	local sendHeaders = headers or {}
	sendHeaders['Proxy-Access-Key'] = self.accessKey
	sendHeaders['Proxy-Target'] = target
	return httpPost(http, self.host .. '/' .. path, data, contentType, compress, sendHeaders)
end

function ProxyHandler:Request(target, path, data)
	data['Url'] = self.host .. '/' .. path
	data.Headers['Proxy-Access-Key'] = self.accessKey
	data.Headers['Proxy-Target'] = target
	return httpRequest(http, data)
end

return ProxyHandler