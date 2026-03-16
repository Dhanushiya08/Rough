import boto3
import tifffile
import numpy as np
from PIL import Image
import io
import base64
import os

s3 = boto3.client("s3")

def lambda_handler(event, context):

    bucket = ""
    key = "rge_input/sample_3page.tiff"

    # extract folder and filename
    folder = os.path.dirname(key)
    filename = os.path.splitext(os.path.basename(key))[0]

    # Download TIFF from S3
    response = s3.get_object(Bucket=bucket, Key=key)
    tiff_bytes = response["Body"].read()

    stored_files = []

    # Read TIFF
    with tifffile.TiffFile(io.BytesIO(tiff_bytes)) as tif:
        images = tif.series[0].asarray()

        for i, img_array in enumerate(images):

            img_array = np.nan_to_num(img_array)

            min_val = img_array.min()
            max_val = img_array.max()

            if max_val > min_val:
                img_array = (img_array - min_val) / (max_val - min_val)

            img_array = (img_array * 255).astype(np.uint8)

            img = Image.fromarray(img_array)

            buffer = io.BytesIO()
            img.save(buffer, format="JPEG")

            image_bytes = buffer.getvalue()

            # Convert to base64
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")

            # S3 output key
            output_key = f"{folder}/{filename}_page{i+1}.txt"

            # Upload base64 text
            s3.put_object(
                Bucket=bucket,
                Key=output_key,
                Body=image_base64,
                ContentType="text/plain"
            )

            stored_files.append(output_key)

    return {
        "statusCode": 200,
        "body": f"Stored files: {stored_files}"
    }



// 
import boto3
import pandas as pd
import json
import io

s3 = boto3.client("s3")

bucket = "your-bucket"
input_prefix = "input-folder/"
output_prefix = "excel-output/"

def lambda_handler(event, context):

    response = s3.list_objects_v2(
        Bucket=bucket,
        Prefix=input_prefix
    )

    for obj in response.get("Contents", []):
        key = obj["Key"]

        # ONLY process files ending with _v2.json
        if not key.endswith("_v2.json"):
            continue

        print("Processing:", key)

        # download JSON
        file_obj = s3.get_object(Bucket=bucket, Key=key)
        content = file_obj["Body"].read().decode("utf-8")
        data = json.loads(content)

        # convert to dataframe
        df = pd.json_normalize(data)

        # create excel in memory
        buffer = io.BytesIO()

        with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False)

        buffer.seek(0)

        # output filename
        filename = key.split("/")[-1].replace("_v2.json", ".xlsx")
        output_key = output_prefix + filename

        # upload to S3
        s3.put_object(
            Bucket=bucket,
            Key=output_key,
            Body=buffer.getvalue()
        )

        print("Uploaded:", output_key)
