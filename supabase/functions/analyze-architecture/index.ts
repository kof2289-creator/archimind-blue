import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role, workflow } = await req.json();
    
    if (!role || !workflow) {
      return new Response(
        JSON.stringify({ error: "담당 업무와 워크플로우를 모두 입력해주세요" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side validation
    if (role.trim().length < 1 || role.length > 200) {
      return new Response(
        JSON.stringify({ error: "담당 업무는 1-200자 사이여야 합니다" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (workflow.trim().length < 10 || workflow.length > 2000) {
      return new Response(
        JSON.stringify({ error: "워크플로우는 10-2000자 사이여야 합니다" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert solution architect. Analyze the provided workflow and business process, taking into account the user's specific role and responsibilities. Generate a comprehensive architecture report in Korean that is tailored to their position.

Your report MUST include these exact sections with EXACTLY these headers:
## 1. 역할 및 책임
List all human roles involved, their responsibilities, and how they interact. Pay special attention to the user's role and how the solution will support them.

## 2. 기대 효과
Specific, measurable outcomes and improvements this solution will deliver, especially for the user's role and department.

## 3. 핵심 키워드
5-7 technical and business keywords that define this solution and are relevant to the user's domain.

## 4. 권장 기술 스택
Specific technologies, frameworks, and tools with brief justifications. Consider the user's role when recommending technologies.

Format the response in clean markdown with these exact section headers. Be specific, actionable, and professional. Make the analysis relevant to the user's specific role and responsibilities.`;

    console.log("Calling Lovable AI for workflow analysis");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `담당 업무: ${role}\n\n워크플로우 분석 요청:\n${workflow}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "크레딧이 부족합니다. 워크스페이스에 크레딧을 추가해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI 분석 중 오류가 발생했습니다" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      console.error("No analysis content in response");
      return new Response(
        JSON.stringify({ error: "분석 결과를 생성하지 못했습니다" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analysis generated successfully");

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-architecture function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});