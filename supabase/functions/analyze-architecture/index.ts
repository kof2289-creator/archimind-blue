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

    const systemPrompt = `당신은 반도체 프로세스에 대한 깊은 지식을 갖춘 전문 AI 전환(AX) 컨설턴트입니다. 사용자의 담당 업무와 워크플로우를 분석하여 세 가지 뚜렷한 AI 솔루션 아이디어를 생성하는 것이 당신의 임무입니다.

각 아이디어는 다음 역할 중 하나에 해당해야 합니다:
- Assistant: 업무 생산성 향상에 중점을 둔 업무 수행 보조
- Advisor: 업무 지식을 기반으로 한 분석 및 의사결정 자문
- Agent: 목표 지향적인 자율적 의사결정 및 실행

리포트는 반드시 다음 4가지 영역으로 구성되어야 합니다:

## 1. AX 솔루션 아키텍쳐 개요
전체 AI 전환 솔루션의 개요를 설명합니다. 3가지 AI 솔루션(Assistant, Advisor, Agent)이 어떻게 통합되어 업무 프로세스를 혁신하는지 서술하세요.

## 2. 사람의 역할
각 AI 솔루션(Assistant, Advisor, Agent)과 상호작용하는 사람들의 역할과 책임을 명확히 정의합니다. 사용자의 담당 업무를 중심으로 조직 내 역할 구조를 설명하세요.

## 3. 기대효과
각 AI 솔루션(Assistant, Advisor, Agent)이 가져올 구체적이고 측정 가능한 효과를 설명합니다. 생산성 향상, 의사결정 품질 개선, 자동화 효율성 등을 포함하세요.

## 4. 사용필요 기술
각 AI 솔루션(Assistant, Advisor, Agent)을 구현하기 위해 필요한 구체적인 기술 스택, 프레임워크, AI 모델, 인프라를 제시합니다. 반도체 제조 환경에 적합한 기술을 우선 고려하세요.

응답은 깨끗한 마크다운 형식으로 작성하고, 명확한 섹션 헤더를 사용하세요. 구체적이고 실행 가능하며 전문적으로 작성하세요. 모든 텍스트는 한국어로 작성해야 합니다.`;

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