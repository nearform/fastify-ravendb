#!/bin/bash

while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' http://localhost:$1/admin/debug/proc/status)" != "200" ]]
do
  sleep 1
done

curl -s -X PUT \
  http://localhost:$1/admin/databases \
  -d '{"DatabaseName":"test"}'

curl -s \
  http://localhost:$1/databases/test/bulk_docs \
  -H 'Content-Type:application/json' \
  -d '{"Commands":[{"Document":{"Name":"test","@metadata":{"@collection":null,"@id":""}},"Id":"test","Type":"PUT"}]}'