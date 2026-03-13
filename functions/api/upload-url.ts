interface Env {
  MINIO_ACCESS_KEY?: string;
  MINIO_SECRET_KEY?: string;
  UPLOAD_PASSWORD?: string;
}

const MINIO_ENDPOINT = "https://str-5511-test-fred.opendata.center";
const BUCKET = "stream-video";
const REGION = "us-east-1";
const OBJECT_KEY = "stream.mp4";
const EXPIRES_IN = 300;

const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(digest);
};

const hmac = async (key: ArrayBuffer | Uint8Array, value: string) => {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key instanceof Uint8Array ? key : new Uint8Array(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
};

const getSigningKey = async (secretKey: string, dateStamp: string) => {
  const kDate = await hmac(encoder.encode(`AWS4${secretKey}`), dateStamp);
  const kRegion = await hmac(kDate, REGION);
  const kService = await hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
};

const buildPresignedPutUrl = async (accessKey: string, secretKey: string) => {
  const now = new Date();
  const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const amzDate = `${iso.slice(0, 8)}T${iso.slice(8, 14)}Z`;
  const dateStamp = amzDate.slice(0, 8);

  const endpointUrl = new URL(MINIO_ENDPOINT);
  const host = endpointUrl.host;
  const canonicalUri = `/${BUCKET}/${OBJECT_KEY}`;
  const credentialScope = `${dateStamp}/${REGION}/s3/aws4_request`;

  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKey}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(EXPIRES_IN),
    "X-Amz-SignedHeaders": "host",
  });

  const canonicalQuery = queryParams
    .toString()
    .split("&")
    .sort()
    .join("&");

  const canonicalHeaders = `host:${host}\n`;
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = await getSigningKey(secretKey, dateStamp);
  const signature = toHex(await hmac(signingKey, stringToSign));

  queryParams.set("X-Amz-Signature", signature);

  const finalUrl = new URL(`${canonicalUri}?${queryParams.toString()}`, MINIO_ENDPOINT);
  return finalUrl.toString();
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (!env.MINIO_ACCESS_KEY || !env.MINIO_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "MINIO_ACCESS_KEY/MINIO_SECRET_KEY não configurados" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (!env.UPLOAD_PASSWORD) {
    return new Response(JSON.stringify({ error: "UPLOAD_PASSWORD não configurada" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { password } = (await request.json()) as { password?: string };

    if (!password || password !== env.UPLOAD_PASSWORD) {
      return new Response(JSON.stringify({ error: "Senha incorreta" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const uploadUrl = await buildPresignedPutUrl(env.MINIO_ACCESS_KEY, env.MINIO_SECRET_KEY);

    return new Response(
      JSON.stringify({
        success: true,
        uploadUrl,
        objectKey: OBJECT_KEY,
        expiresIn: EXPIRES_IN,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao gerar URL de upload" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};
