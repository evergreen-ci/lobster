node server --logs ./e2e > e2e_srv.log &
sleep 5
export LOBSTER_E2E_SERVER_PORT=$(cat e2e_srv.log | tail -n 1 | sed 's/App listening on 127.0.0.1:\([0-9]*\)!/\1/')
echo $LOBSTER_E2E_SERVER_PORT
if [[ $CI -eq "true" ]]; then
    npm run test:ci:e2e
else
    npm run test:raw:e2e
fi
kill %1
