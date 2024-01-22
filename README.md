# Yubico Validation Server - Next.js
This project is a fully functional Yubico Validation Server for
registering and validating Yubico OTPs. You can use this instead of
YubiCloud.

## Motivation
Apart from having bought a YubiKey, and wanting to do something for
it, I found that registering a key in YubiCloud gives you no guarantees
that the company will not delete it ([really](https://upload.yubico.com/)).

The available code for creating your own Validation Server is written in
PHP with lots of code, and I wanted to keep it simple using TypeScript and Next.js.

> Note: This project is not an official Yubico product

## High-level overview
This API can handle:
- Registering a key
- Validating an OTP

It uses Upstash Redis to store registered keys.

## Registering a key
To register a key, make a `POST` request with a JSON body:

```
POST /register
{
  "publicId": "cccjgjgkhcbb",
  "privateId": "be9d7dc18d60",
  "secretKey": "26a2b67387c6f35cc734904ac8f3b7c0",
  "otp": "cccjgjgkhcbbirdrfdnlnghhfgrtnnlgedjlftrbdeut"
}
```

This will encrypt the sensitive information and store it in Upstash
Redis.

Responses can be `403` or `200`.

## Validating an OTP
To validate an OTP, make a `GET` request with the OTP as a query parameter:

```
GET /validate?otp=cccjgjgkhcbbirdrfdnlnghhfgrtnnlgedjlftrbdeut
```

This endpoint will check if the passed OTP belongs to a registered
key, decrypt the OTP and validate it, and then check if the counters are correct.

The counters are checked to prevent replay attacks. The new counter values
are updated so the OTPs cannot be used anymore.

Responses can be `403` or `200`.

```
// 403
{ "error": "MESSAGE", isValid: false }

// 200
{ "success": true, isValid: true, publicId: "cccjgjgkhcbb" }
```

## Running it
For installing the dependencies and starting the app:

```
npm install
npm run dev
```

Create a `.env.local` file with the environment variables.

> Check out `.env.example`

## Using it live
You can use https://yubico-validation-server.vercel.app to see how it
looks deployed. It is using a free version of Upstash Redis, so might
fail if used intensively.

> Do not use this url in production. Deploy your own

## Further improvements
- Optionally restrict access to be used with custom API key.
- UI so users can register their keys by their own ([like in Yubico](https://upload.yubico.com/)).

## People
- [Iñigo Taibo](https://itaibo.com/)
