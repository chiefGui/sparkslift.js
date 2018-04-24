// ====================================================================================================
//
// Cloud Code for AWS, write your code here to customize the GameSparks platform.
//
// For details of the GameSparks Cloud Code API see https://docs.gamesparks.com/
//
// ====================================================================================================
require('sha')
require('GameLiftCredentials')

function hmac (key, keyEncoding, string) {
  var shaObj = new JSSHA('SHA-256', 'TEXT')
  shaObj.setHMACKey(key, keyEncoding)
  shaObj.update(string)

  return shaObj.getHMAC('HEX')
}

function hash (string) {
  return Spark.getDigester().sha256Hex(string)
}

/**
 * AWS
 * @param - options.service - The requested service
 * @param - options.region - Region of this AWS Service
 * @param - options.headers - Request headers given in object format {"key": "value"}
 * @param - options.params - Request parameters given in object format {"key": "value"}
 * @param - options.payload - Request payload given in object format {"key": "value"}
 **/

var AWS = function (options) {
  this.method = 'POST'
  this.region = options.region
  this.service = 'gamelift' || options.service
  this.canonicalUri = '/'
  this.date = new Date()
  this.params = options.params || {}
  this.headers = options.headers || {}
  this.payload = options.payload || {}
  this.payload = JSON.stringify(this.payload)
  this.host = this.service + '.' + this.region + '.amazonaws.com'

  this.key = GAMELIFT_CREDENTIALS.key
  this.secret = GAMELIFT_CREDENTIALS.secret

  this.headers.Host = this.host // Must be present in headers
  this.headers['X-Amz-Date'] = this.awsDateTimeFormat()

  var reqHeader = JSON.parse(JSON.stringify(this.headers))
  reqHeader.Authorization = this.getAuthHeader()

  var res = Spark.getHttp(this.getRequestUrl())
    .setHeaders(reqHeader)
    .postString(this.payload)

  return {
    status: res.getResponseCode(),
    json: res.getResponseJson()
  }
}

AWS.prototype.getRequestUrl = function () {
  var u = 'https://' + this.host

  if (Object.keys(this.params).length > 0) {
    u = +'?' + this.getCanonicalQueryString()
  }

  return u
}

AWS.prototype.getCanonicalHeaders = function () {
  var h = this.headers
  return Object.keys(h)
    .sort()
    .map(function (name) {
      return name.toLowerCase().trim() + ':' + h[name].toString().trim() + '\n'
    })
    .join('')
}

AWS.prototype.getCanonicalQueryString = function () {
  var p = this.params
  return Object.keys(p)
    .sort()
    .map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(p[key])
    })
    .join('&')
}

AWS.prototype.getAuthHeader = function () {
  return (
    'AWS4-HMAC-SHA256 Credential=' +
    this.key +
    '/' +
    this.getAwsCredentialScope() +
    ', SignedHeaders=' +
    this.getAwsSignedHeaders() +
    ', Signature=' +
    this.getAwsCredentialSignature()
  )
}

AWS.prototype.getAwsCredentialSignature = function () {
  return hmac(
    this.getAwsCredentialSignatureKey(),
    'HEX',
    this.getAwsCredentialSignatureValue()
  )
}

AWS.prototype.getAwsCredentialSignatureKey = function () {
  var h1 = hmac('AWS4' + this.secret, 'TEXT', this.awsDateTimeFormatShort())
  var h2 = hmac(h1, 'HEX', this.region)
  var h3 = hmac(h2, 'HEX', this.service)
  return hmac(h3, 'HEX', 'aws4_request')
}

AWS.prototype.getAwsCredentialSignatureValue = function () {
  return [
    'AWS4-HMAC-SHA256',
    this.awsDateTimeFormat(),
    this.getAwsCredentialScope(),
    hash(this.getCanonicalRequest())
  ].join('\n')
}

AWS.prototype.getCanonicalRequest = function () {
  return [
    this.method,
    this.canonicalUri,
    this.getCanonicalQueryString(),
    this.getCanonicalHeaders(),
    this.getAwsSignedHeaders(),
    hash(this.payload)
  ].join('\n')
}

AWS.prototype.getAwsSignedHeaders = function () {
  return Object.keys(this.headers)
    .sort()
    .map(function (name) {
      return name.toLowerCase().trim()
    })
    .join(';')
}

AWS.prototype.getAwsCredentialScope = function () {
  return [
    this.awsDateTimeFormatShort(),
    this.region,
    this.service,
    'aws4_request'
  ].join('/')
}

AWS.prototype.awsDateTimeFormat = function () {
  return this.date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

AWS.prototype.awsDateTimeFormatShort = function () {
  return this.awsDateTimeFormat().substring(0, 8)
}
