#!/usr/bin/env node

const fs = require("fs");
const chalk = require("chalk");
const AWS = require("aws-sdk");

const config = require(`${process.cwd()}/package.json`);

const EXIT = (state = 1) => {
  process.exit(state);
};

const bindee = require("commander");

bindee
  .version(config.version)
  .description(
    "Use bindee to fetch key-value secrets and generate an env.yml file"
  )
  .option(
    "-s, --secret-name <secret name>",
    "name of the secret to fetch (required)"
  )
  .option("-f, --file-name <file name>", "name of the output file")
  .option("-r, --region <region>", "AWS region")
  .option("-A, --access-key-id <access key id>", "AWS IAM Access Key Id")
  .option(
    "-S, --secret-access-key <secret access key>",
    "AWS IAM Secret Access Key"
  )
  .option(
    "-P, --aws-profile <profile></profile>",
    "Select which AWS credentials should be used"
  )
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  bindee.outputHelp(chalk.yellow);
  EXIT();
}

const {
  secretName,
  fileName = "env.yml",
  region = "eu-west-1",
  accessKeyId,
  secretAccessKey,
  awsProfile
} = bindee;

AWS.config.update({ region });

// Initialise credentials
let credentials = new AWS.SharedIniFileCredentials();

// Check for AWS preset env variables
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;
if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  credentials = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  };
}

if (accessKeyId && secretAccessKey) {
  credentials = { accessKeyId, secretAccessKey };
}

// Check for supplied AWS profile argument
if (awsProfile) {
  credentials = new AWS.SharedIniFileCredentials({ profile: awsProfile });
}

if (!Object.keys(credentials).length) {
  console.error(chalk.red("> AWS credentials not found\n"));
  EXIT();
}

// Set AWS credentials
AWS.config.credentials = credentials;

// Create a Secrets Manager client
const smClient = new AWS.SecretsManager({
  region
});

// Retrieve Secret
smClient.getSecretValue({ SecretId: secretName }, (err, data) => {
  console.log(chalk.yellow(`> fetching secret [${secretName}]`));
  if (err) {
    console.error(err);
  } else {
    if ("SecretString" in data) {
      console.log(chalk.green(`> secret retrived`));
      let secret = JSON.parse(data.SecretString);
      console.log(chalk.yellow(`> constructing ${fileName}`));

      // Retrieve default values from package.json
      const {
        bindee: { include }
      } = config;

      if (include) {
        secret = { ...secret, ...include };
      }

      // Create YAML document structure
      const doc = Object.entries(secret).reduce((a, b) => {
        a += `${b[0]}: ${b[1]}\n`;
        return a;
      }, "");

      // Write to YAML file
      fs.writeFile(fileName, doc, err => {
        if (err) {
          console.log(err);
          EXIT();
        }
        console.error(chalk.green(`> ${fileName} successfully constructed`));
        EXIT(0);
      });
    } else {
      console.error(chalk.red("> unable to locate SecretString property\n"));
      EXIT();
    }
  }
});
