#!/bin/bash

while ! nc -z localhost $1; do
  sleep 0.1;
done

curl -s -X PUT \
  http://localhost:$1/admin/databases \
  -d '{"DatabaseName":"test"}'

curl -s \
  http://localhost:$1/databases/test/bulk_docs \
  -H 'Content-Type:application/json' \
  -d '{"Commands":[{"Document":{"Name":"test","@metadata":{"@collection":null,"@id":""}},"Id":"test","Type":"PUT"}]}'