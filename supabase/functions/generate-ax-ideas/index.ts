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
    const { businessArea, painPoints, expectations } = await req.json();
    
    if (!businessArea || !painPoints || !expectations) {
      return new Response(
        JSON.stringify({ error: "모든 필드를 입력해주세요" }),
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

    const systemPrompt = `당신은 제조산업 프로세스에 대한 깊은 지식을 갖춘 전문 AI 전환(AX) 컨설턴트입니다. 당신의 임무는 사용자의 입력을 기반으로 세 가지 뚜렷한 AI 솔루션 아이디어를 생성하는 것입니다. 각 아이디어는 다음 역할 중 하나에 해당해야 합니다:
- Assistant: 업무 생산성 향상에 중점을 둔 업무 수행 보조.
- Advisor: 업무 지식을 기반으로 한 분석 및 의사결정 자문.
- Agent: 목표 지향적인 자율적 의사결정 및 실행.
응답은 반드시 3개의 아이디어 객체를 포함하는 JSON 배열이어야 합니다. 제공된 스키마를 엄격히 준수하고 모든 텍스트는 한국어로 작성해야 합니다.`;

    const userPrompt = `다음 사용자 정보를 기반으로 AX 과제 아이디어 카드 3개를 생성해 주세요. 각 카드는 Assistant, Advisor, Agent 역할에 대해 하나씩 만들어야 합니다.

- 업무 영역: ${businessArea}
- 현행 업무 고충 및 한계점: ${painPoints}
- AX 도입을 통한 기대 사항: ${expectations}`;

    console.log("Calling Lovable AI for AX ideas generation");

    const body: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_ax_ideas",
            description: "Generate 3 AX solution ideas with specific roles",
            parameters: {
              type: "object",
              properties: {
                ideas: {
                  type: "array",
                  items: {
                  type: "object",
                    properties: {
                      solutionTitle: { type: "string", description: "솔루션에 대한 짧고 눈길을 끄는 제목. 예: 'AI 기반 실시간 품질 이상 감지 시스템'" },
                      process: { type: "string", description: "이 솔루션이 적용될 간단한 업무 프로세스. 예: '데이터 입력 > AI 분석 > 결과 검토'" },
                      category: { type: "string", enum: ["Assistant", "Advisor", "Agent"], description: "솔루션의 역할 유형: Assistant, Advisor, 또는 Agent 중 하나." },
                      solutionOverview: { type: "string", description: "AX 솔루션 아이디어에 대한 간결한 1-3문장 요약." },
                      humanRole: { type: "string", description: "이 새로운 프로세스에서 사람의 역할에 대한 간결한 설명. 예: 'AI가 감지한 이상 징후 검토 및 조치 승인'" },
                      expectedEffects: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "3-5가지 주요 이점 목록. 짧은 구(2-4 단어)여야 합니다. 예: '품질 일관성 향상', '오류 감소', '업무 신속성 향상'"
                      },
                      keywords: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "3-5개의 관련 키워드 목록. 짧은 구여야 합니다. 예: '예측 분석', '실시간 모니터링', '의사결정 지원'"
                      },
                      technologies: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "3-5개의 관련 기술 목록. 예: '머신러닝 기반 예측 모델', '데이터 마이닝', '시뮬레이션'"
                      }
                    },
                    required: ["solutionTitle", "process", "category", "solutionOverview", "humanRole", "expectedEffects", "keywords", "technologies"],
                    additionalProperties: false
                  },
                  minItems: 3,
                  maxItems: 3
                }
              },
              required: ["ideas"],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "generate_ax_ideas" } }
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || !toolCall.function?.arguments) {
      console.error("No tool call in response");
      return new Response(
        JSON.stringify({ error: "아이디어를 생성하지 못했습니다" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ideas = JSON.parse(toolCall.function.arguments).ideas;

    console.log("Ideas generated successfully");

    return new Response(
      JSON.stringify({ ideas }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-ax-ideas function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
