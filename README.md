# bindee

> Simple CLI tool that fetches key-value secrets from AWS Secrets Manager and generates an env.yml file
> designed to be used in a CI environment

## Features

- Fetches specified secret
- Allows default attributes to included in constructed files

## Install

Locally, for usage with `npx`:

```
$ npm i bindee -D
```

Or globally:

```
$ npm i bindee -g
```

## Usage

```
Usage: bindee [options]

Use bindee to fetch key-value secrets and generate a YAML file

Options:
  -V, --version                                  output the version number
  -s, --secret-name <secret name>                name of the secret to fetch (required)
  -f, --file-name <file name>                    name of the output file (default: env.yml)
  -r, --region <region>                          AWS region (default: eu-west-1)
  -aki, --access-key-id <access key id>          AWS IAM Access Key Id
  -sak, --secret-access-key <secret access key>  AWS IAM Secret Access Key
  -p, --aws-profile <profile></profile>          Select which AWS credentials should be used
  -h, --help                                     output usage information



```

## Example

```
$ npx bindee --s production-server-secret
```

Output (env.yml):

```
SECRET_ONE: bindee
JWT_SECRET: YAT

```

## Including Default Values

Place a property in `package.json` and it will be included in all generated files:

```
...
  "bindee": {
    "include": {
      BASE_URL: https://github.com/FBI23/bindee,
      SEED: 123,
    }
  }
  ...
```

## License

MIT © [Yatin Badal](https://yatin.io)
