#!/bin/sh
set -eu

cat > /usr/share/nginx/html/assets/env.js <<EOF
window.__EXPLORAMAS_ENV__ = {
  "apiBaseUrl": "${FRONT_API_BASE_URL:-http://localhost:8080/api}",
  "restCountriesUrl": "${FRONT_REST_COUNTRIES_URL:-https://restcountries.com/v3.1/all?fields=name,cca2,translations,flag,idd}"
};
EOF
