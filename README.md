# bindee [WIP]

> Simple CLI tool that fetches key-value secrets from AWS Secrets Manager and generates an env.yml file
> designed to be used in a CI

## Features

- Fetches specified secret
- Allows default attributes to included in constructed files

## Install

```
$ npm i bindee
```

## Usage

```
$ npx bindee --secretName production-server
```

## License

MIT © [Yatin Badal](https://yatin.io)
