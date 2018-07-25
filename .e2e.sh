#npm run build
node server --logs ./e2e > e2e_srv.log &
trap "kill %1" EXIT

sleep 5
export LOBSTER_E2E_SERVER_PORT=$(cat e2e_srv.log | tail -n 1 | sed 's/App listening on 127.0.0.1:\([0-9]*\)!/\1/')
if [[ $CI -eq "true" ]]; then
    npm run test:ci -- -t 'e2e.*'
else
    npm run test -- -t 'e2e.*'
fi
