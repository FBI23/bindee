#!/usr/bin/env node

const fs = require("fs");
const chalk = require("chalk");
const argv = require("minimist")(process.argv.slice(2));
const AWS = require("aws-sdk");

const config = require("../..package.json");

const EXIT = (state = 1) => {
  process.exit(state);
};

// File name
const fileName = argv["fileName"] || "env.yml";

// Set region
const { region = "eu-west-1" } = argv;
AWS.config.update({ region });

// Initialise credentials
let credentials;

// Check for AWS preset env variables
if (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY) {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;
  credentials = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  };
} else {
  // Check for supplied AWS arguments
  if (
    argv.hasOwnProperty("accessKeyId") &&
    argv.hasOwnProperty("secretAccessKey")
  ) {
    const { accessKeyId, secretAccessKey } = argv;
    credentials = { accessKeyId, secretAccessKey };
  }
}

// Check for supplied AWS profile argument
if (argv.hasOwnProperty("awsProfile")) {
  const { awsProfile } = argv;
  credentials = new AWS.SharedIniFileCredentials({ profile: awsProfile });
} else {
  // Get default AWS profile
  credentials = new AWS.SharedIniFileCredentials();
}

if (!Object.keys(credentials).length) {
  console.error(chalk.red("> AWS credentials not found\n"));
  EXIT();
}

// Set AWS credentials
AWS.config.credentials = credentials;

if (!argv.hasOwnProperty("secretName")) {
  console.error(chalk.red("> --secretName is required\n"));
  EXIT();
}

// Secret to retrieve
const { secretName } = argv;

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

      if (
        config.hasOwnProperty("bindee") &&
        config.bindee.hasOwnProperty("include")
      ) {
        secret = { ...secret, ...config.bindee.include };
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
