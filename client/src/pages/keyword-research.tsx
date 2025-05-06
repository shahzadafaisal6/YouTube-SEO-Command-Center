import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Keyword } from "@/hooks/use-keywords";

const keywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  volume: z.string().optional(),
  trend: z.string().optional(),
});

type KeywordFormValues = z.infer<typeof keywordSchema>;

export default function KeywordResearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch keywords
  const { data: keywords = [], isLoading, refetch } = useQuery<Keyword[]>({
    queryKey: ['/api/keywords'],
  });

  const form = useForm<KeywordFormValues>({
    resolver: zodResolver(keywordSchema),
    defaultValues: {
      keyword: "",
      volume: "",
      trend: "",
    },
  });

  async function onSubmit(data: KeywordFormValues) {
    try {
      // Convert volume to number if provided
      const formattedData = {
        ...data,
        volume: data.volume ? parseInt(data.volume) : undefined,
      };
      
      // Add your API call to create the keyword here
      await apiRequest({
        url: "/api/keywords",
        method: "POST",
        data: formattedData,
      });
      
      // Reset form and close dialog
      form.reset();
      setDialogOpen(false);
      
      // Refetch keywords
      refetch();
    } catch (error) {
      console.error("Error creating keyword:", error);
    }
  }

  // Filter keywords based on search term
  const filteredKeywords = keywords.filter((keyword: Keyword) => 
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to render trend icon
  const renderTrendIcon = (trend: string) => {
    if (!trend) return <Minus className="h-4 w-4 text-gray-500" />;
    
    const trendValue = trend.startsWith('+') ? parseFloat(trend.substring(1)) : parseFloat(trend);
    
    if (isNaN(trendValue)) return <Minus className="h-4 w-4 text-gray-500" />;
    
    if (trendValue > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trendValue < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0e1118]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Keyword Research</h1>
              <p className="text-gray-400">Track and analyze YouTube keywords</p>
            </div>
            <div className="flex gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search keywords..."
                  className="pl-9 bg-[#1e2231] border-[#2a3146] text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <Plus className="h-4 w-4 mr-2" /> Add Keyword
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#151827] border-[#1e2231] text-white">
                  <DialogHeader>
                    <DialogTitle>Add New Keyword</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Add a new keyword to track for YouTube SEO analysis.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="keyword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Keyword</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter keyword" 
                                className="bg-[#1e2231] border-[#2a3146] text-white" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="volume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Monthly Search Volume (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g. 1000" 
                                className="bg-[#1e2231] border-[#2a3146] text-white" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="trend"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Trend (optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. +5%" 
                                className="bg-[#1e2231] border-[#2a3146] text-white" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setDialogOpen(false)}
                          className="border-[#2a3146] text-gray-400"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="gradient-primary">
                          Add Keyword
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-[#151827] border-[#1e2231] text-white">
              <CardHeader>
                <CardTitle>Tracked Keywords</CardTitle>
                <CardDescription className="text-gray-400">
                  {filteredKeywords.length} keywords found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="bg-[#1a1f2e]">
                    <TableRow className="hover:bg-[#1e2231] border-[#2a3146]">
                      <TableHead className="text-gray-400 w-[300px]">Keyword</TableHead>
                      <TableHead className="text-gray-400">Search Volume</TableHead>
                      <TableHead className="text-gray-400">Trend</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeywords.length === 0 ? (
                      <TableRow className="hover:bg-[#1e2231] border-[#2a3146]">
                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                          No keywords found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredKeywords.map((keyword: Keyword) => (
                        <TableRow key={keyword.id} className="hover:bg-[#1e2231] border-[#2a3146]">
                          <TableCell className="font-medium text-white">
                            {keyword.keyword}
                          </TableCell>
                          <TableCell>
                            {keyword.volume?.toLocaleString() || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {renderTrendIcon(keyword.trend)}
                              <span>{keyword.trend || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#2a3146] text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
                              >
                                Analyze
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#2a3146] text-gray-400 hover:bg-gray-500/10 hover:text-gray-300"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t border-[#1e2231] px-6 py-4">
                <div className="text-sm text-gray-400">
                  Pro tip: Track competitors' high-performing keywords to improve your content strategy.
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}