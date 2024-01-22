import { Readable } from "stream";
import {
  AWS_ACCESS_ID,
  AWS_BUCKET,
  AWS_REGION,
  AWS_ACCESS_SECRET,
} from "../../../config.js";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";

export class S3Util {
  protected static bucketName = AWS_BUCKET;

  protected static client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_ID,
      secretAccessKey: AWS_ACCESS_SECRET,
    },
  });

  public static createPresignUrl(
    Key: string,
    expiresIn = 3600,
    Bucket = AWS_BUCKET,
  ) {
    const cmd = new GetObjectCommand({ Bucket, Key });
    return getSignedUrl(this.client, cmd, { expiresIn });
  }

  public static parrallelUpload(
    key: string,
    data: string | Uint8Array | Buffer | Readable,
    contentType?: string,
  ) {
    const up = new Upload({
      client: this.client,
      params: {
        Key: key,
        Body: data,
        ContentType: contentType,
        Bucket: this.bucketName,
      },
    });

    return up.done();
  }

  public static uploadToS3(
    key: string,
    data: string | Uint8Array | Buffer | Readable,
    contentType?: string,
  ) {
    const cmd = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: data,
      ContentType: contentType,
    });
    return this.client.send(cmd);
  }
}
