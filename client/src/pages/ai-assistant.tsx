import React, { useState } from 'react';
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Tag, File, Image, RefreshCcw, ChevronRight, Copy, Check, MessagesSquare } from "lucide-react";

type AITask = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  prompt: string;
  endpoint: string;
  inputPlaceholder: string;
  fields?: {
    name: string;
    type: 'text' | 'textarea' | 'select';
    placeholder?: string;
    label: string;
    options?: { value: string; label: string }[];
  }[];
};

export default function AIAssistant() {
  const [activeTask, setActiveTask] = useState<AITask | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [wasCopied, setWasCopied] = useState(false);
  const { toast } = useToast();
  
  // Handle pre-selected tasks from URL parameters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskParam = urlParams.get('task');
    
    if (taskParam) {
      // Find the matching task based on the URL parameter
      const taskMap: Record<string, string> = {
        'topic-ideas': 'chat', // Map to the SEO Chatbot with a pre-filled question
        'title': 'title',
        'description': 'description',
        'tags': 'tags',
        'thumbnail': 'thumbnail'
      };
      
      const taskId = taskMap[taskParam];
      if (taskId) {
        const foundTask = aiTasks.find(task => task.id === taskId);
        if (foundTask) {
          setActiveTask(foundTask);
          
          // If it's the topic-ideas task, pre-fill the chat input with a request for video topic ideas
          if (taskParam === 'topic-ideas') {
            setInputs({
              question: "Can you suggest 10 trending YouTube video topics for my channel related to YouTube SEO and optimization that would perform well based on current search trends?"
            });
          }
        }
      }
    }
  }, []);

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setWasCopied(true);
      setTimeout(() => setWasCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "The generated content has been copied to your clipboard."
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const generateContent = async () => {
    if (!activeTask) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Prepare the data to send based on the task
      const data = {
        ...inputs,
        taskType: activeTask.id,
      };

      // Make API request
      const response = await apiRequest({
        url: `/api/ai/${activeTask.endpoint}`,
        method: 'POST',
        data,
      });

      setResult(response.result || response.content || "No content generated. Please try again.");
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const aiTasks: AITask[] = [
    {
      id: 'title',
      name: 'Title Generator',
      icon: <Wand2 className="h-5 w-5" />,
      description: 'Create SEO-optimized titles for your YouTube videos',
      prompt: 'Generate a catchy, SEO-optimized title based on my video content and target keywords.',
      endpoint: 'generate-title',
      inputPlaceholder: 'Enter your original title or video topic...',
      fields: [
        {
          name: 'originalTitle',
          type: 'textarea',
          label: 'Original Title or Video Topic',
          placeholder: 'Enter your current title or describe your video content...'
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'Target Keywords (comma separated)',
          placeholder: 'seo, youtube, optimization, marketing, etc.'
        },
        {
          name: 'style',
          type: 'select',
          label: 'Title Style',
          options: [
            { value: 'curiosity', label: 'Curiosity-Driven' },
            { value: 'howto', label: 'How-To / Tutorial' },
            { value: 'list', label: 'List-Based (Top 10, etc.)' },
            { value: 'question', label: 'Question-Based' },
            { value: 'emotional', label: 'Emotional Appeal' },
          ]
        }
      ]
    },
    {
      id: 'description',
      name: 'Description Writer',
      icon: <File className="h-5 w-5" />,
      description: 'Write optimized YouTube video descriptions with timestamps',
      prompt: 'Generate a detailed video description with keywords, timestamps, and calls to action.',
      endpoint: 'generate-description',
      inputPlaceholder: 'Enter your video details...',
      fields: [
        {
          name: 'videoTitle',
          type: 'text',
          label: 'Video Title',
          placeholder: 'Enter your video title...'
        },
        {
          name: 'content',
          type: 'textarea',
          label: 'Video Content Summary',
          placeholder: 'Briefly describe what your video is about...'
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'Target Keywords (comma separated)',
          placeholder: 'tutorial, guide, how-to, youtube, etc.'
        },
        {
          name: 'includeTimestamps',
          type: 'select',
          label: 'Include Timestamps',
          options: [
            { value: 'yes', label: 'Yes, generate timestamps' },
            { value: 'no', label: 'No timestamps needed' }
          ]
        }
      ]
    },
    {
      id: 'tags',
      name: 'Tag Generator',
      icon: <Tag className="h-5 w-5" />,
      description: 'Create optimized tags for better discoverability',
      prompt: 'Generate a set of tags for your video based on content and trends.',
      endpoint: 'generate-tags',
      inputPlaceholder: 'Enter your video details...',
      fields: [
        {
          name: 'videoTitle',
          type: 'text',
          label: 'Video Title',
          placeholder: 'Enter your video title...'
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Video Description',
          placeholder: 'Enter your video description or content summary...'
        },
        {
          name: 'existingTags',
          type: 'text',
          label: 'Existing Tags (comma separated)',
          placeholder: 'Any existing tags you want to keep (optional)'
        }
      ]
    },
    {
      id: 'thumbnail',
      name: 'Thumbnail Analyzer',
      icon: <Image className="h-5 w-5" />,
      description: 'Get optimization suggestions for your thumbnails',
      prompt: 'Analyze a thumbnail URL and provide suggestions for improvement.',
      endpoint: 'analyze-thumbnail',
      inputPlaceholder: 'Enter your thumbnail URL...',
      fields: [
        {
          name: 'thumbnailUrl',
          type: 'text',
          label: 'Thumbnail URL',
          placeholder: 'Enter the URL of your thumbnail image...'
        },
        {
          name: 'videoTitle',
          type: 'text',
          label: 'Video Title',
          placeholder: 'Enter your video title for context...'
        }
      ]
    },
    {
      id: 'chat',
      name: 'SEO Chatbot',
      icon: <MessagesSquare className="h-5 w-5" />,
      description: 'Chat with AI about YouTube SEO strategies',
      prompt: 'Ask any question about YouTube SEO and content strategy.',
      endpoint: 'seo-chat',
      inputPlaceholder: 'Ask a YouTube SEO question...',
      fields: [
        {
          name: 'question',
          type: 'textarea',
          label: 'Your Question',
          placeholder: 'Ask anything about YouTube SEO, content strategy, audience growth, etc.'
        }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#0e1118]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
            <p className="text-gray-400">Leverage AI to optimize your YouTube content</p>
          </div>

          <Tabs defaultValue="tools" className="space-y-5">
            <TabsList className="bg-[#1a1f2e] border-[#2a3146]">
              <TabsTrigger value="tools" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                AI Tools
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tools" className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {aiTasks.map((task) => (
                  <Card 
                    key={task.id}
                    className={`bg-[#151827] border-[#1e2231] text-white cursor-pointer hover:bg-[#1a1f2e] transition-colors ${activeTask?.id === task.id ? 'ring-2 ring-indigo-500' : ''}`}
                    onClick={() => {
                      setActiveTask(task);
                      setInputs({});
                      setResult(null);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="bg-[#252a3a] h-10 w-10 rounded-lg flex items-center justify-center text-indigo-400">
                          {task.icon}
                        </div>
                        <Badge variant="outline" className="border-indigo-500/50 text-indigo-400">
                          AI Powered
                        </Badge>
                      </div>
                      <CardTitle className="mt-4 text-lg">{task.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {task.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-indigo-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTask(task);
                          setInputs({});
                          setResult(null);
                        }}
                      >
                        Use Tool <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {activeTask && (
                <Card className="mt-8 bg-[#151827] border-[#1e2231] text-white overflow-hidden">
                  <div className="h-1 w-full bg-indigo-500"></div>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#252a3a] h-10 w-10 rounded-lg flex items-center justify-center text-indigo-400">
                        {activeTask.icon}
                      </div>
                      <div>
                        <CardTitle>{activeTask.name}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {activeTask.prompt}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeTask.fields?.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          {field.label}
                        </label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            placeholder={field.placeholder}
                            className="min-h-[120px] bg-[#1e2231] border-[#2a3146] text-white"
                            value={inputs[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                          />
                        ) : field.type === 'select' ? (
                          <Select 
                            value={inputs[field.name] || ''} 
                            onValueChange={(value) => handleInputChange(field.name, value)}
                          >
                            <SelectTrigger className="bg-[#1e2231] border-[#2a3146] text-white">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e2231] border-[#2a3146] text-white">
                              {field.options?.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder={field.placeholder}
                            className="bg-[#1e2231] border-[#2a3146] text-white"
                            value={inputs[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setInputs({});
                        setResult(null);
                      }}
                      className="border-[#2a3146] text-gray-400"
                    >
                      <RefreshCcw className="h-4 w-4 mr-2" /> Clear
                    </Button>
                    <Button 
                      className="gradient-primary"
                      onClick={generateContent}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" /> Generate
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {result && (
                <Card className="mt-8 bg-[#151827] border-[#1e2231] text-white overflow-hidden">
                  <div className="h-1 w-full bg-green-500"></div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>AI Generated Result</CardTitle>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-[#2a3146] text-gray-400 hover:text-white"
                        onClick={copyToClipboard}
                      >
                        {wasCopied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-[#1a1f2e] rounded-lg p-4 whitespace-pre-wrap">
                      {result}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              <Card className="bg-[#151827] border-[#1e2231] text-white">
                <CardHeader>
                  <CardTitle>Generation History</CardTitle>
                  <CardDescription>Your recent AI generation requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-400">
                    <h3 className="text-lg mb-2">No history yet</h3>
                    <p className="text-sm">Once you generate content with the AI tools, it will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}