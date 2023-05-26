import json
import os

import boto3
from boto3.dynamodb.conditions import Key


def read_handler(event, context):
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(os.environ["DYNAMODB_DATA_TABLE_NAME"])
    body = json.loads(event["body"])

    if not "keys" in body:
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }

    data = []

    for key_id in body["keys"]:
        response = table.query(KeyConditionExpression=Key("key_id").eq(key_id))

        if len(response["Items"]) < 1:
            break

        data.extend(response["Items"])

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        "body": json.dumps({
            "data": data
        })
    }
