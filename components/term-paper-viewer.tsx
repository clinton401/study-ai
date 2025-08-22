"use client";

import * as React from "react";
import {
  ArrowLeft,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FullTermPaper as TermPaper } from "@/models/term-paper";
import {CopyExport} from "./copy-exports";
import {AIContentDisplay} from "@/components/ai-content-display";
import {EditContentModal} from "@/components/edit-content-modal";
import { useQueryClient } from "@tanstack/react-query";

// interface TermPaper {
//   id: number;
//   topic: string;
//   type: string;
//   tone: string;
//   length: string;
//   wordCount: number;
//   createdAt: string;
//   preview: string;
// }

interface TermPaperViewerProps {
  paper: TermPaper;
  onClose: () => void;
  sort?: string;
  type?: string;
  handleEditedContent?: (content: string) => void;
}

// const getFullContent = (paper: TermPaper) => {
//   return `# ${paper.topic}

// ## Introduction

// ${paper.preview}

// This comprehensive analysis explores the multifaceted relationship between environmental changes and economic systems worldwide. The research draws from extensive data collected over the past decade, examining both direct and indirect impacts on various economic sectors.

// ## Literature Review

// Recent studies have highlighted the growing concern among economists and policymakers regarding the long-term implications of environmental degradation on global markets. Smith et al. (2023) demonstrated that climate-related events have resulted in approximately $150 billion in economic losses annually across developed nations.

// The theoretical framework for understanding these relationships was established by Johnson (2022), who proposed the Environmental-Economic Nexus Theory. This theory suggests that environmental health and economic prosperity are intrinsically linked, with degradation in one area inevitably affecting the other.

// ## Methodology

// This study employs a mixed-methods approach, combining quantitative analysis of economic data with qualitative assessments of policy impacts. Data was collected from:

// - World Bank economic indicators (2020-2024)
// - Environmental Protection Agency reports
// - International Monetary Fund climate finance databases
// - Primary interviews with 50 industry leaders

// ## Analysis and Findings

// ### Economic Sector Impacts

// The analysis reveals significant variations in how different economic sectors respond to environmental challenges:

// **Agriculture**: The agricultural sector shows the highest vulnerability, with crop yields declining by an average of 12% in regions experiencing severe weather events.

// **Manufacturing**: Industrial production has adapted more successfully, with many companies investing in sustainable technologies that have actually improved efficiency by 8-15%.

// **Services**: The service sector demonstrates remarkable resilience, with minimal direct impacts but significant opportunities for growth in environmental consulting and green technologies.

// ### Regional Variations

// Geographic analysis reveals distinct patterns:

// - **North America**: Strong regulatory frameworks have facilitated adaptation, though initial costs were substantial
// - **Europe**: Leading in policy innovation, with the European Green Deal serving as a model for other regions
// - **Asia-Pacific**: Rapid industrialization creates both challenges and opportunities for sustainable development
// - **Africa**: Limited resources constrain adaptation efforts, despite high vulnerability to environmental changes

// ## Policy Implications

// The findings suggest several critical policy recommendations:

// 1. **Investment in Green Infrastructure**: Governments should prioritize sustainable infrastructure development to build economic resilience.

// 2. **Carbon Pricing Mechanisms**: Implementing comprehensive carbon pricing can drive market-based solutions while generating revenue for adaptation measures.

// 3. **International Cooperation**: Cross-border collaboration is essential for addressing global challenges that transcend national boundaries.

// 4. **Education and Training**: Workforce development programs must evolve to meet the demands of a changing economy.

// ## Conclusion

// The relationship between environmental health and economic prosperity is complex but undeniable. While challenges are significant, the transition to sustainable economic models presents unprecedented opportunities for innovation and growth.

// Future research should focus on developing more sophisticated modeling techniques to predict long-term impacts and identify optimal policy interventions. The window for proactive action is narrowing, making immediate, coordinated responses essential for maintaining economic stability while addressing environmental concerns.

// ## References

// Johnson, M. (2022). Environmental-Economic Nexus Theory: A Framework for Understanding Interconnected Systems. *Journal of Environmental Economics*, 45(3), 234-251.

// Smith, A., Brown, K., & Davis, L. (2023). Climate-Related Economic Losses in Developed Nations: A Decade of Analysis. *Global Economic Review*, 78(2), 112-128.

// World Bank. (2024). *Climate Change Action Plan 2021-2025*. Washington, DC: World Bank Publications.`;
// };

export function TermPaperViewer({ paper, onClose, sort= "", type= "", handleEditedContent }: TermPaperViewerProps) {
 
  const queryClient = useQueryClient();
  const fullContent = paper.content;



  const getToneColor = (tone: string) => {
    switch (tone) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "formal":
        return "bg-purple-100 text-purple-800";
      case "casual":
        return "bg-green-100 text-green-800";
      case "friendly":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const invalidateQuery = async(content: string ) => {
    await Promise.all([
      queryClient.invalidateQueries(
        {
          queryKey: ["stats-content"],
          exact: true,
          refetchType: "active",
        },
        {
          throwOnError: true,
          cancelRefetch: true,
        }
      ),
      queryClient.invalidateQueries(
        {
          queryKey: ["contents", sort, type],
          exact: true,
          refetchType: "active",
        },
        {
          throwOnError: true,
          cancelRefetch: true,
        }
      ),
    ]);
    handleEditedContent?.(content)
  }
  const getLengthColor = (length: string) => {
    switch (length) {
      case "short":
        return "bg-yellow-100 text-yellow-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "long":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 top-0 z-50 bg-background">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex sm:items-center flex-col sm:flex-row flex-wrap gap-4 justify-between border-b px-6 py-4">
          <div className="flex min-w-[200px]  items-center flex-1 gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 flex flex-col">
              <h1 className="text-xl w-full font-semibold line-clamp-1">
                {paper.topic}
              </h1>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {paper.type.replace("-", " ")}
                </Badge>
                <Badge className={getToneColor(paper.tone)}>{paper.tone}</Badge>
                <Badge className={getLengthColor(paper.length)}>
                  {paper.length}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {paper.wordCount} words
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(paper.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex fle-wrap items-center gap-1">
            <EditContentModal
              content={paper.content}
              invalidateQuery={invalidateQuery}
              id={paper._id.toString()}
            />
            <CopyExport
              content={paper.content}
              filename={paper.topic.slice(0, 20)}
            />
            {/* <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button> */}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto p-6">
              <Card>
                <CardContent className="">
                  {/* <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap font-serif text-base leading-relaxed"> */}
                  <AIContentDisplay content={fullContent} />
                  {/* {fullContent} */}
                  {/* </div>
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
