# bindee

> Simple CLI tool that fetches key-value secrets from AWS Secrets Manager and generates an env.yml file
> designed to be used in a CI environment

## Features

- Fetches specified secret
- Allows default attributes to included in constructed files

## Install

Locally, for usage with `npx`:

```
$ npm i bindee -S
```

Or globally:

```
$ npm i bindee -g
```

## Usage

```
Usage: bindee [options]

Use bindee to fetch key-value secrets and generate an env.yml file

Options:
  -V, --version                                output the version number
  -s, --secret-name <secret name>              name of the secret to fetch (required)
  -f, --file-name <file name>                  name of the output file (default: env.yml)
  -r, --region <region>                        AWS region
  -A, --access-key-id <access key id>          AWS IAM Access Key Id
  -S, --secret-access-key <secret access key>  AWS IAM Secret Access Key
  -P, --aws-profile <profile></profile>        Select which AWS credentials should be used
  -h, --help                                   output usage information

```

## Example

```
$ npx bindee --secretName production-server-secret
```

Output (env.yml):

```
SECRET_ONE: bindee
JWT_SECRET: YAT

```

## License

MIT © [Yatin Badal](https://yatin.io)
