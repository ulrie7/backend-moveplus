// Import AWS SDK v3 modules
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');

class S3Manager {
    constructor(config) {
        this.s3 = new S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            }
        });
        this.defaultBucket = config.defaultBucket;
        this.region = config.region
    }

    // Upload file buffer to S3
    async uploadBuffer(buffer, fileName, bucket = this.defaultBucket, isPublic = false) {
        const uploadParams = {
            Bucket: bucket,
            Key: fileName,
            Body: buffer,
            ACL: isPublic ? 'public-read' : 'private', // Set permissions based on whether it's public or private
        };

        try {
            const result = await this.s3.send(new PutObjectCommand(uploadParams));
            const url = `https://${bucket}.s3.${this.s3.config.region}.amazonaws.com/${fileName}`;
            return { url, result };
        } catch (error) {
            throw new Error(`S3 Upload Error: ${error.message}`);
        }
    }

    // Upload file from a stream
    async uploadFile(filePath, fileName, bucket = this.defaultBucket, isPublic = false) {
        const mimeType = path.extname(fileName).toLowerCase()
        const fileStream = fs.createReadStream(filePath);

        const uploadParams = {
            Bucket: bucket,
            Key: fileName,
            Body: fileStream,
            ContentType: mimeType,
            // ACL: isPublic ? 'public-read' : 'private',
        };

        try {
            const result = await this.s3.send(new PutObjectCommand(uploadParams));
            const url = `https://${bucket}.s3.${this.region}.amazonaws.com/${fileName}`;

            return { url, result };
        } catch (error) {
            throw new Error(`S3 Upload Error: ${error.message}`);
        }
    }

    // Delete file from S3
    async deleteFile(fileName, bucket = this.defaultBucket) {
        const deleteParams = {
            Bucket: bucket,
            Key: fileName,
        };

        try {
            const result = await this.s3.send(new DeleteObjectCommand(deleteParams));
            return { success: true, result };
        } catch (error) {
            throw new Error(`S3 Delete Error: ${error.message}`);
        }
    }

    // Delete files from S3
    async deleteFiles(fileNames, bucket = this.defaultBucket) {
        try {
            if (!Array.isArray(fileNames)) fileNames = [fileNames]

            const results = []
            for (const fileName of fileNames) {
                results.push(await this.deleteFile(fileName, bucket))
            }

            return { success: true, results };
        } catch (error) {
            throw new Error(`S3 Delete Error: ${error.message}`);
        }
    }

    // Generate a presigned URL to download a file
    async getSignedUrl(fileName, expiresIn = 3600, bucket = this.defaultBucket) {
        const getObjectParams = {
            Bucket: bucket,
            Key: fileName,
        };

        try {
            const url = await getSignedUrl(this.s3, new GetObjectCommand(getObjectParams), { expiresIn });
            return url;
        } catch (error) {
            throw new Error(`S3 Get Signed URL Error: ${error.message}`);
        }
    }

    // Download file from S3 as stream
    async downloadFile(fileName, bucket = this.defaultBucket) {
        const getObjectParams = {
            Bucket: bucket,
            Key: fileName,
        };

        try {
            const result = await this.s3.send(new GetObjectCommand(getObjectParams));
            const fileStream = result.Body;

            // If you want to save the stream locally, use the following code:
            // const writeStream = fs.createWriteStream(`./downloads/${fileName}`);
            // fileStream.pipe(writeStream);

            return fileStream; // Returns readable stream
        } catch (error) {
            throw new Error(`S3 Download Error: ${error.message}`);
        }
    }

    // Convert S3 stream to buffer
    async streamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', chunk => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }

    // Save a file from S3 directly to the local filesystem
    async downloadAndSaveFile(fileName, localPath, bucket = this.defaultBucket) {
        try {
            const fileStream = await this.downloadFile(fileName, bucket);
            const writeStream = fs.createWriteStream(localPath);
            fileStream.pipe(writeStream);

            return new Promise((resolve, reject) => {
                writeStream.on('finish', () => resolve(localPath));
                writeStream.on('error', reject);
            });
        } catch (error) {
            throw new Error(`S3 Download and Save Error: ${error.message}`);
        }
    }
}

module.exports = S3Manager;