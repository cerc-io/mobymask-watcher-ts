import path from 'path';
import fs from 'fs-extra';
import toml from 'toml';
import convict from 'convict';

const tomlParser: convict.Parser = {
  parse: toml.parse,
  extension: 'toml'
};

async function main (): Promise<void> {
  getConfig('environments/local.toml');
}

export const getConfig = async (configFile: string): Promise<void> => {
  const configFilePath = path.resolve(configFile);
  const fileExists = await fs.pathExists(configFilePath);
  if (!fileExists) {
    throw new Error(`Config file not found: ${configFilePath}`);
  }

  const tomlConfig = toml.parse(fs.readFileSync(configFilePath, 'utf8'));
  console.log('toml config', JSON.stringify(tomlConfig.metrics, null, 2));

  convict.addParser(tomlParser);
  const convictConfig = convict({
    metrics: {
      host: {
        env: 'METRICS_HOST',
        default: undefined,
        format: String
      },
      port: {
        env: 'METRICS_PORT',
        default: undefined,
        format: Number
      }
    }
  }).loadFile(configFilePath);
  console.log('convictConfig', JSON.stringify(convictConfig.get('metrics'), null, 2));

  // With env:
  // METRICS_PORT=2001
  // METRICS_GQL_PORT=2002

  // Output:

  // toml config {
  //   "host": "127.0.0.1",
  //   "port": 9000,
  //   "gql": {
  //     "port": 9001
  //   }
  // }
  // convictConfig {
  //   "host": "127.0.0.1",
  //   "port": 2001,
  //   "gql": {
  //     "port": 9001
  //   }
  // }
};

main()
  .then()
  .catch((error) => {
    console.error('Error:', error);
  });
