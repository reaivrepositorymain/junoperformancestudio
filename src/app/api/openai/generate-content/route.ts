import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('API route called');
    
    const { proposalTitle, headline } = await request.json();
    console.log('Received:', { proposalTitle, headline });

    if (!proposalTitle || !headline) {
      return NextResponse.json(
        { error: 'Proposal title and headline are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `
Based on the following proposal information, generate professional content for a software development proposal:

Proposal Title: "${proposalTitle}"
Headline: "${headline}"

Please generate:
1. A compelling subtitle that follows this format and style:
   "A customized [solution type] to [main benefit], [secondary benefit], and [tertiary benefit] by [specific method/approach] and leveraging [technology/methodology]."
   
   Example: "A customized UX + Automation solution to streamline customer interactions, reduce costs, and optimize performance by avoiding WordPress plugin bloat and leveraging scalable AI solutions."

2. A comprehensive overview (3-4 paragraphs describing the project scope, benefits, and value proposition)

Requirements for subtitle:
- Start with "A customized" or "A comprehensive" 
- Include specific solution type (e.g., "UX + Automation solution", "Web Development platform", "Digital transformation system")
- List 3 main benefits using action words (streamline, reduce, optimize, enhance, improve, etc.)
- Include specific methodology or approach (avoiding common pitfalls, leveraging modern tech, etc.)
- Keep it professional but engaging
- Focus on business value and technical advantages

Requirements for overview:
- Make it professional and engaging
- Focus on software development, automation, or digital transformation benefits
- Mention value propositions like efficiency, scalability, user experience, etc.
- Keep the tone professional but approachable
- Address business challenges and technical solutions

IMPORTANT: Return ONLY valid JSON in this exact format, no extra text or explanations:
{
  "subtitle": "Generated subtitle here following the specified format",
  "overview": "Generated overview here (multiple paragraphs)"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional proposal writer specializing in software development and automation projects. You MUST respond with valid JSON only. No markdown, no explanations, just pure JSON. Create detailed, specific subtitles that highlight business value and technical approach."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    console.log('Raw OpenAI response:', response);
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Clean and parse the JSON response
    let generatedContent;
    try {
      // Remove any markdown code blocks
      let cleanedResponse = response.trim();
      
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/\s*```$/, '');
      }

      // Try to find JSON content between curly braces
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      console.log('Cleaned response:', cleanedResponse);

      // Parse the cleaned JSON
      generatedContent = JSON.parse(cleanedResponse);
      
      // Validate the structure
      if (!generatedContent.subtitle || !generatedContent.overview) {
        throw new Error('Invalid response structure');
      }

    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed to parse response:', response);
      
      // Enhanced fallback with more specific subtitle format
      const solutionTypes = [
        "UX + Automation solution",
        "Web Development platform",
        "Digital transformation system",
        "Custom Software solution",
        "AI-powered automation platform"
      ];
      
      const benefits = [
        ["streamline operations", "reduce manual overhead", "enhance user experience"],
        ["optimize performance", "improve scalability", "reduce maintenance costs"],
        ["automate workflows", "increase efficiency", "modernize infrastructure"],
        ["enhance productivity", "reduce errors", "improve data accuracy"]
      ];
      
      const methods = [
        "eliminating legacy system limitations and leveraging modern cloud technologies",
        "avoiding third-party plugin dependencies and implementing custom scalable solutions",
        "integrating AI-powered automation and utilizing performance-optimized frameworks",
        "implementing best practices and leveraging cutting-edge development methodologies"
      ];
      
      const randomSolutionType = solutionTypes[Math.floor(Math.random() * solutionTypes.length)];
      const randomBenefits = benefits[Math.floor(Math.random() * benefits.length)];
      const randomMethod = methods[Math.floor(Math.random() * methods.length)];
      
      const fallbackSubtitle = `A customized ${randomSolutionType} to ${randomBenefits[0]}, ${randomBenefits[1]}, and ${randomBenefits[2]} by ${randomMethod}.`;
      
      const fallbackOverview = `Our ${proposalTitle} solution addresses your core business challenges through innovative technology and strategic implementation.

We understand that modern businesses require efficient, scalable solutions that drive growth and enhance user experience. Our comprehensive approach combines cutting-edge software development with proven methodologies to deliver measurable results.

Through careful analysis and strategic planning, we'll implement a solution that not only meets your immediate needs but also provides a foundation for future expansion. Our team specializes in creating robust, user-friendly applications that integrate seamlessly with your existing infrastructure.

The end result is a powerful, efficient system that reduces operational costs, improves productivity, and positions your organization for long-term success in an increasingly competitive marketplace.`;

      generatedContent = {
        subtitle: fallbackSubtitle,
        overview: fallbackOverview
      };
    }

    console.log('Final parsed content:', generatedContent);

    return NextResponse.json({
      success: true,
      data: generatedContent
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}