export async function serveAdminAttachment(request, env, documentId) {
  if (!env.DB) throw new Error("Database binding is not configured.");
  if (!env.fh_lead_attachments) throw new Error("R2 attachment storage is not configured.");

  const document = await env.DB.prepare(
    "SELECT file_url, file_name FROM documents WHERE id = ? AND type = 'project_attachment' LIMIT 1"
  ).bind(documentId).first();

  if (!document?.file_url) {
    return new Response("Attachment not found.", { status: 404 });
  }

  const object = await env.fh_lead_attachments.get(document.file_url, {
    range: request.headers,
  });

  if (!object || !("body" in object)) {
    return new Response("Attachment not found.", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Content-Disposition", `inline; filename="${String(document.file_name || "attachment").replace(/[\\"\r\n]/g, "_").slice(0, 180)}"`);
  headers.set("ETag", object.httpEtag);
  if (!object.range && object.size != null) headers.set("Content-Length", String(object.size));

  return new Response(object.body, {
    status: object.range ? 206 : 200,
    headers,
  });
}
