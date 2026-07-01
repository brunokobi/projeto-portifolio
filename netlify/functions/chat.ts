import type { Handler } from "@netlify/functions";
import { getTracer, flushOtel, SpanStatusCode } from "./_otel";

interface FormPayload {
  nome?: string;
  email?: string;
  mensagem?: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL ?? "brunokobi@gmail.com";

  if (!resendKey) {
    console.error("[chat] RESEND_API_KEY não configurada");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "RESEND_API_KEY not configured" }),
    };
  }

  let payload: FormPayload;
  try {
    payload = JSON.parse(event.body ?? "{}") as FormPayload;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { nome = "—", email = "—", mensagem = "—" } = payload;

  const tracer = getTracer("chat");
  const span = tracer?.startSpan("chat.contact", {
    attributes: {
      "contact.has_name": nome !== "—",
      "contact.has_email": email !== "—",
      "contact.message_length": mensagem.length,
    },
  });

  try {
    const subject = `📡 Novo contato de ${nome}`;
    const emailSpan = tracer?.startSpan("resend.sendEmail", {
      attributes: {
        "email.subject": subject,
        "messaging.system": "resend",
      },
    });

    const notifyRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portifólio Bruno Kobi <onboarding@resend.dev>",
        to: [toEmail],
        subject,
        html: `
          <div style="font-family:monospace;background:#000;color:#00ff41;padding:24px;border:1px solid #00ff41;border-radius:8px;">
            <h2 style="color:#00ff41;letter-spacing:4px;">▌ NOVA TRANSMISSÃO ▐</h2>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#00ff41;">${email}</a></p>
            <p><strong>Mensagem:</strong></p>
            <blockquote style="border-left:3px solid #00ff41;padding-left:12px;color:#aaffaa;">${mensagem.replace(/\n/g, "<br>")}</blockquote>
          </div>
        `,
      }),
    });

    if (!notifyRes.ok) {
      const err = await notifyRes.text();
      console.error("[chat] Resend notificação falhou:", err);
      emailSpan?.setAttribute("http.response_status_code", notifyRes.status);
      emailSpan?.setStatus({ code: SpanStatusCode.ERROR, message: err });
      emailSpan?.end();
      span?.setStatus({ code: SpanStatusCode.ERROR });
      span?.end();
      await flushOtel();
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Email notification failed", detail: err }),
      };
    }

    emailSpan?.setAttribute("http.response_status_code", 200);
    emailSpan?.setStatus({ code: SpanStatusCode.OK });
    emailSpan?.end();
    span?.setStatus({ code: SpanStatusCode.OK });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ok: true }),
    };
  } catch (error: unknown) {
    console.error("[chat] Erro inesperado:", error);
    span?.recordException(error as Error);
    span?.setStatus({ code: SpanStatusCode.ERROR });
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        error: "Unexpected error",
        message: error instanceof Error ? error.message : String(error),
      }),
    };
  } finally {
    span?.end();
    await flushOtel();
  }
};
