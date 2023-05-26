import base64
import json
import os

import boto3


def read_handler(event, context):
    kms = boto3.client("kms")

    response = kms.generate_data_key(
        KeyId=os.environ["KMS_MASTER_KEY_ID"],
        KeySpec="AES_256"
    )

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        "body": json.dumps({
            "cipher": base64.b64encode(response["CiphertextBlob"]).decode(),
            "secret": base64.b64encode(response["Plaintext"]).decode(),
        })
    }
