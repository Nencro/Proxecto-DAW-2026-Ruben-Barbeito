const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');
const outputPath = path.join(root, 'assets', 'env.js');

function parseEnv(content) {
  return content.split(/\r?\n/).reduce((values, line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return values;
    }

    const separator = trimmed.indexOf('=');

    if (separator === -1) {
      return values;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');

    return {
      ...values,
      [key]: value
    };
  }, {});
}

const fileValues = fs.existsSync(envPath)
  ? parseEnv(fs.readFileSync(envPath, 'utf8'))
  : {};

const runtimeConfig = {
  apiBaseUrl: fileValues.FRONT_API_BASE_URL || '',
  restCountriesUrl: fileValues.FRONT_REST_COUNTRIES_URL || ''
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `window.__EXPLORAMAS_ENV__ = ${JSON.stringify(runtimeConfig, null, 2)};\n`
);
