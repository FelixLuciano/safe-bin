import base64
import json
import os

import boto3
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


def update_delete_handler(event, context):
    if not "key_id" in event["pathParameters"]:
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }

    kms = boto3.client("kms")
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(os.environ["DYNAMODB_DATA_TABLE_NAME"])

    key_id = event["pathParameters"]["key_id"]
    method = event["httpMethod"]
    headers = event["headers"]
    body = json.loads(event["body"])

    response = None
    response = table.get_item(Key={"key_id": key_id})

    if "Item" not in response:
        return {
            "statusCode": 404,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }
    elif headers is None or "Authorization" not in headers:
        return {
            "statusCode": 403,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }

    data = response["Item"]["bin"]

    try:
        kms_response = kms.decrypt(
            KeyId=os.environ["KMS_MASTER_KEY_ID"],
            CiphertextBlob=force_bytes(headers["Authorization"]),
        )

        verify_data = AES_256_ECB(kms_response["Plaintext"]).verify(data)
        if not verify_data:
            raise Exception()

        if method == "PUT" and not AES_256_ECB(kms_response["Plaintext"]).verify(
            body["data"]
        ):
            raise Exception()
    except Exception:
        return {
            "statusCode": 403,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }

    if method == "PUT":
        table.update_item(
            Key={"key_id": key_id},
            UpdateExpression="SET bin = :val1",
            ExpressionAttributeValues={":val1": body["data"]},
        )
    elif method == "DELETE":
        table.delete_item(Key={"key_id": key_id})

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
        },
    }


class AES_256_ECB:
    """cryptography AES-256-ECB
    Based on: https://gist.github.com/tcitry/df5ee377ad112d7637fe7b9211e6bc83
    """

    def __init__(self, key: bytes):
        self.key = key

        backend = default_backend()

        self.encryptor = Cipher(
            algorithms.AES(self.key), modes.ECB(), backend
        ).encryptor()
        self.decryptor = Cipher(
            algorithms.AES(self.key), modes.ECB(), backend
        ).decryptor()

    def encrypt(self, message: str):
        data = message.encode()
        padder = padding.PKCS7(algorithms.AES(self.key).block_size).padder()
        padded_data = padder.update(data) + padder.finalize()
        encrypted_text = self.encryptor.update(padded_data) + self.encryptor.finalize()

        return force_text(encrypted_text)

    def decrypt(self, message: str):
        data = base64.b64decode(message.encode())
        padder = padding.PKCS7(algorithms.AES(self.key).block_size).unpadder()
        decrypted_data = self.decryptor.update(data)
        unpadded = padder.update(decrypted_data) + padder.finalize()

        return unpadded.decode()

    def verify(self, message: str):
        try:
            self.decrypt(message)
            return True
        except Exception:
            return False


def force_text(data):
    return base64.b64encode(data).decode()


def force_bytes(data):
    return base64.b64decode(data.encode())
