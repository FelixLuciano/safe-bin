import base64
import json
import os

import boto3


def create_read_handler(event, context):
    if not "key_id" in event["pathParameters"]:
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }

    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(os.environ["DYNAMODB_DATA_TABLE_NAME"])

    key_id = event["pathParameters"]["key_id"]
    method = event["httpMethod"]

    response = None
    response = table.get_item(Key={"key_id": key_id})
    item_found = "Item" in response

    if method == "GET":
        if not item_found:
            return {
                "statusCode": 404,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                },
            }

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            "body": json.dumps({"data": response["Item"]["bin"]}),
        }

    body = json.loads(event["body"])

    if method == "POST":
        if item_found:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                },
            }

        table.put_item(
            Item={
                "key_id": key_id,
                "bin": body["data"],
            }
        )

        return {
            "statusCode": 201,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }
