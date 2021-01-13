const {writeFile} = require('fs');
const {argv} = require('yargs');
// read environment variables from .env file
require('dotenv').config();

// read the command line arguments passed with yargs
const environment = argv.environment;
const isProduction = environment === 'prod';

let targetPath = `./src/environments/environment.ts`;
if (environment === 'prod') targetPath = `./src/environments/environment.prod.ts`;
else if (environment === 'stg') targetPath = `./src/environments/environment.staging.ts`;
else if (environment === 'features') targetPath = `./src/environments/environment.features.ts`;
else if (environment === 'local') targetPath = `./src/environments/environment.local.ts`;
// we have access to our environment variables
// in the process.env object thanks to dotenv
const environmentFileContent = `
export const environment = {
   production: ${isProduction},
   API_ENDPOINT: "${process.env.API_ENDPOINT}",
   GOOGLE_MAP_API_KEY: "${process.env.GOOGLE_MAP_API_KEY}",
   STRIPE_PUBLISHABLE_KEY: "${process.env.STRIPE_PUBLISHABLE_KEY}",
   IMAGEKIT_URL: "${process.env.IMAGEKIT_URL}",
   PREDEFINED: ${process.env.PREDEFINED}
};
`;
// write the content to the respective file
writeFile(targetPath, environmentFileContent, err => {
  if (err) console.log(err);
  console.log(`Wrote variables to ${targetPath}`);
});
