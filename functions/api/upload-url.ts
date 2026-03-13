// functions/upload-url.ts
// Cloudflare Pages Function — gera presigned URL para upload no MinIO
// Variáveis de ambiente necessárias (Cloudflare Pages → Settings → Environment Variables):
//   MINIO_ACCESS_KEY → Access Key do MinIO
//   MINIO_SECRET_KEY → Secret Key do MinIO

interface Env {
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
}

const MINIO_ENDPOINT = "https://str-5511-test-fred.opendata.center";
const BUCKET = "stream-video";
const REGION = "us-east-1";
const OBJECT_KEY = "stream.mp4";
const EXPIRES_IN = 300; // segundos — 5 minutos para completar o upload

// Gera presigned URL via AWS Signature V4 (compatível com MinIO)
async function generatePresignedPutUrl(
  accessKey: string,
  secretKey: string,
  endpoint: string,
  bucket: string,
  key: string,
  region: string,
  expiresIn: number
): Promise<string> {
  const now = new Date();
  const datestamp = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const amzdate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z"; // YYYYMMDDTHHmmssZ

  const credentialScope = `${datestamp}/${region}/s3/aws4_request`;
  const credential = `${accessKey}/${credentialScope}`;

  const url = new URL(`/${bucket}/${key}`, endpoint);

  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzdate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  });

  url.search = queryParams.toString();

  const canonicalUri = `/${bucket}/${key}`;
  const canonicalQueryString = queryParams.toString();
  const canonicalHeaders = `host:${url.hostname}\n`;
  const signedHeaders = "host";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzdate,
    credentialScope,
    await sha256hex(canonicalRequest),
  ].join("\n");

  const signingKey = await getSigningKey(secretKey, datestamp, region, "s3");
  const signature = await hmacHex(signingKey, stringToSign);

  url.searchParams.set("X-Amz-Signature", signature);

  return url.toString();
}

async function sha256hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

async function hmacHex(key: ArrayBuffer | Uint8Array, message: string): Promise<string> {
  const result = await hmac(key, message);
  return Array.from(new Uint8Array(result))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getSigningKey(
  secretKey: string,
  datestamp: string,
  region: string,
  service: string
): Promise<ArrayBuffer> {
  const kDate = await hmac(new TextEncoder().encode(`AWS4${secretKey}`), datestamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  return kSigning;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Valida credenciais
  if (!env.MINIO_ACCESS_KEY || !env.MINIO_SECRET_KEY) {
    return new Response(
      JSON.stringify({ error: "Credenciais do MinIO não configuradas." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const presignedUrl = await generatePresignedPutUrl(
      env.MINIO_ACCESS_KEY,
      env.MINIO_SECRET_KEY,
      MINIO_ENDPOINT,
      BUCKET,
      OBJECT_KEY,
      REGION,
      EXPIRES_IN
    );

    return new Response(
      JSON.stringify({ url: presignedUrl }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erro ao gerar presigned URL.", detail: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
