/** True on Vercel, AWS Lambda, and similar read-only/ephemeral serverless runtimes. */
export const isServerless = () =>
  Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
