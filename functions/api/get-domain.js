export async function onRequest(context) {
  // context.env.ISSUER 是在 Pages 后台配置的服务绑定 (Service Binding)
  // 指向 app-backup-domains Worker
  if (!context.env.ISSUER) {
    return new Response('ISSUER binding not found', { status: 500 });
  }

  try {
    // 内部调用 Worker
    const response = await context.env.ISSUER.fetch(context.request.clone());
    return response;
  } catch (err) {
    return new Response('Error calling ISSUER: ' + err.message, { status: 500 });
  }
}
