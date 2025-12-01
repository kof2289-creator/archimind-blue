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

    const systemPrompt = `당신은 제조 산업 프로세스에 대한 깊은 지식을 갖춘 전문 AI 전환(AX) 컨설턴트입니다. 당신의 임무는 사용자의 입력을 기반으로 세 가지 뚜렷한 AI 솔루션 아이디어를 생성하는 것입니다. 각 아이디어는 다음 역할 중 하나에 해당해야 합니다:
- Assistant: 업무 생산성 향상에 중점을 둔 업무 수행 보조.
- Advisor: 업무 지식을 기반으로 한 분석 및 의사결정 자문.
- Agent: 목표 지향적인 자율적 의사결정 및 실행.

각 아이디어는 제목, 역할, 솔루션 설명, 사람의 역할, 기대효과, 기대효과 세부사항(배열), 키워드(배열), 기술(배열)을 포함해야 합니다. 모든 텍스트는 한국어로 작성해야 합니다.`;

    const userPrompt = `다음 사용자 정보를 기반으로 AX 과제 아이디어 3개를 생성해 주세요. 각 아이디어는 Assistant, Advisor, Agent 역할에 대해 하나씩 만들어야 합니다.

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
                      title: { type: "string", description: "아이디어 제목" },
                      role: { type: "string", enum: ["Assistant", "Advisor", "Agent"] },
                      description: { type: "string", description: "솔루션 설명" },
                      userRole: { type: "string", description: "사람의 역할" },
                      expectedEffect: { type: "string", description: "기대 효과 요약" },
                      effectDetails: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "기대 효과 세부사항"
                      },
                      keywords: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "핵심 키워드"
                      },
                      technologies: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "권장 기술"
                      }
                    },
                    required: ["title", "role", "description", "userRole", "expectedEffect", "effectDetails", "keywords", "technologies"],
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
