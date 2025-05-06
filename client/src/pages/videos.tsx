import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import type { Video } from "@/hooks/use-videos";

export default function VideosPage() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  // Fetch videos
  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  // Generate optimization
  const handleOptimize = async (videoId: number) => {
    try {
      const optimizations = await apiRequest({
        url: `/api/videos/${videoId}/optimize`,
        method: 'POST'
      });
      console.log("Generated optimizations:", optimizations);
      // Refetch videos to get updated data
      // queryClient.invalidateQueries(['/api/videos']);
    } catch (error) {
      console.error("Error generating optimizations:", error);
    }
  };

  // Filter videos by status if filter is active
  const filteredVideos = videos.filter((video: Video) => {
    if (filter === "all") return true;
    return video.status === filter;
  });

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
              <h1 className="text-2xl font-bold text-white">My Videos</h1>
              <p className="text-gray-400">Manage and optimize your YouTube videos</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px] bg-[#1e2231] border-[#2a3146] text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2231] border-[#2a3146] text-white">
                  <SelectItem value="all">All Videos</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
              <Button className="gradient-primary">Add Video</Button>
            </div>
          </div>

          <Card className="bg-[#151827] border-[#1e2231] text-white">
            <CardHeader>
              <CardTitle>YouTube Videos</CardTitle>
              <CardDescription className="text-gray-400">
                {filteredVideos.length} videos found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-[#1a1f2e]">
                  <TableRow className="hover:bg-[#1e2231] border-[#2a3146]">
                    <TableHead className="text-gray-400 w-[300px]">Video</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">SEO Score</TableHead>
                    <TableHead className="text-gray-400">Published</TableHead>
                    <TableHead className="text-gray-400">Views</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.length === 0 ? (
                    <TableRow className="hover:bg-[#1e2231] border-[#2a3146]">
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No videos found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVideos.map((video: Video) => (
                      <TableRow key={video.id} className="hover:bg-[#1e2231] border-[#2a3146]">
                        <TableCell className="font-medium flex items-center gap-3">
                          <img 
                            src={video.thumbnailUrl || 'https://via.placeholder.com/120x68'} 
                            alt={video.title} 
                            className="w-[120px] h-[68px] rounded object-cover"
                          />
                          <div className="truncate max-w-[200px]">
                            <div className="font-medium text-white truncate">{video.title}</div>
                            <div className="text-xs text-gray-400">ID: {video.youtubeId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              video.status === 'published' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20' : 
                              video.status === 'private' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/20' :
                              'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
                            }
                          >
                            {video.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-[40px] h-[6px] rounded-full bg-[#252a3a] overflow-hidden">
                              <div 
                                className={`h-full ${
                                  video.seoScore >= 80 ? 'bg-green-500' : 
                                  video.seoScore >= 60 ? 'bg-yellow-500' : 
                                  'bg-red-500'
                                }`}
                                style={{ width: `${video.seoScore}%` }}
                              />
                            </div>
                            <span className="text-sm">{video.seoScore}/100</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(video.publishedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {video.analytics && video.analytics[0]
                            ? video.analytics[0].views.toLocaleString()
                            : "0"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVideo(video);
                                setOptimizeDialogOpen(true);
                              }}
                              className="border-[#2a3146] text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
                            >
                              Optimize
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-[#2a3146] text-gray-400 hover:bg-gray-500/10 hover:text-gray-300"
                            >
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Optimization Dialog */}
      <Dialog open={optimizeDialogOpen} onOpenChange={setOptimizeDialogOpen}>
        <DialogContent className="bg-[#151827] border-[#1e2231] text-white">
          <DialogHeader>
            <DialogTitle>Optimize Video</DialogTitle>
            <DialogDescription className="text-gray-400">
              Generate AI-powered optimization suggestions for your video.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={selectedVideo?.thumbnailUrl || 'https://via.placeholder.com/120x68'} 
                alt={selectedVideo?.title} 
                className="w-[120px] h-[68px] rounded object-cover"
              />
              <div>
                <h4 className="font-medium text-white">{selectedVideo?.title}</h4>
                <div className="text-xs text-gray-400">
                  Published: {selectedVideo?.publishedAt ? new Date(selectedVideo.publishedAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              This will analyze your video content and generate optimization suggestions for the title, 
              description, tags, and thumbnail to improve SEO performance.
            </p>
            
            <p className="text-xs text-gray-400 mb-2">Optimization includes:</p>
            <ul className="text-xs text-gray-400 list-disc list-inside space-y-1 mb-4">
              <li>SEO score assessment</li>
              <li>Title optimization for CTR</li>
              <li>Description keyword enhancement</li>
              <li>Tag suggestions based on trending topics</li>
              <li>Thumbnail analysis and recommendations</li>
            </ul>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOptimizeDialogOpen(false)}
              className="border-[#2a3146] text-gray-400 hover:bg-gray-500/10 hover:text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              className="gradient-primary"
              onClick={() => {
                if (selectedVideo) {
                  handleOptimize(selectedVideo.id);
                  setOptimizeDialogOpen(false);
                }
              }}
            >
              Generate Optimizations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}