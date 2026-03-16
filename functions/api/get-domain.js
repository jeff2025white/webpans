export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');

  // 从环境变量获取 SECRET，如果没设置则使用默认值（建议你在后台设置 WEBPANS_SECRET）
  const SECRET = context.env.WEBPANS_SECRET || "default_salt_888";
  
  if (!code || code.length !== 4) {
    return new Response('Invalid passcode format', { status: 403 });
  }

  // 验证逻辑：前三位数字之和 + 密钥特征值，取模 10 应等于第四位
  // 这里的密钥特征值我们简单取 SECRET 字符串长度或字符之和
  let secretCharSum = 0;
  for (let i = 0; i < SECRET.length; i++) {
    secretCharSum += SECRET.charCodeAt(i);
  }

  let sum = 0;
  for (let j = 0; j < 3; j++) {
    sum += parseInt(code.charAt(j), 10);
  }

  const expectedDigit = (sum + secretCharSum) % 10;
  if (parseInt(code.charAt(3), 10) !== expectedDigit) {
    return new Response('Unauthorized: Incorrect passcode', { status: 403 });
  }

  // context.env.ISSUER 是在 Pages 后台配置的服务绑定 (Service Binding)
  if (!context.env.ISSUER) {
    return new Response('ISSUER binding not found', { status: 500 });
  }

  try {
    // 内部调用 Worker
    return await context.env.ISSUER.fetch(context.request.clone());
  } catch (err) {
    return new Response('Error calling ISSUER: ' + err.message, { status: 500 });
  }
}
