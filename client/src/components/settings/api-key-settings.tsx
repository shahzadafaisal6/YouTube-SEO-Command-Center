import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Copy, Key, Plus, Trash2, RotateCw, Check, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

type ApiKey = {
  id: number;
  name: string;
  key: string;
  type: string;
  isActive: boolean;
  lastUsed?: string;
  usageCount: number;
  quotaLimit: number;
  quotaUsed: number;
};

type ApiKeySettingsProps = {
  apiKeys: ApiKey[];
  refetch: () => void;
};

export function ApiKeySettings({ apiKeys, refetch }: ApiKeySettingsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    key: '',
    type: 'youtube',
    isActive: true,
    quotaLimit: 10000
  });
  const [editedApiKey, setEditedApiKey] = useState({
    name: '',
    key: '',
    quotaLimit: 0,
    isActive: true
  });
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Filter API keys by type
  const youtubeApiKeys = apiKeys.filter(key => key.type === 'youtube');
  const openaiApiKeys = apiKeys.filter(key => key.type === 'openai');
  const otherApiKeys = apiKeys.filter(key => key.type !== 'youtube' && key.type !== 'openai');

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "API Key copied",
      description: "The API key has been copied to your clipboard.",
    });
  };

  const handleAddApiKey = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest({
        url: '/api/api-keys',
        method: 'POST',
        data: newApiKey
      });
      
      setIsAddDialogOpen(false);
      setNewApiKey({
        name: '',
        key: '',
        type: 'youtube',
        isActive: true,
        quotaLimit: 10000
      });
      
      refetch();
      
      toast({
        title: "API Key added",
        description: "Your new API key has been added successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to add API key",
        description: "There was an error adding your API key.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setEditedApiKey({
      name: apiKey.name,
      key: apiKey.key,
      quotaLimit: apiKey.quotaLimit,
      isActive: apiKey.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleEditApiKey = async () => {
    if (!selectedApiKey) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest({
        url: `/api/api-keys/${selectedApiKey.id}`,
        method: 'PATCH',
        data: editedApiKey
      });
      
      setIsEditDialogOpen(false);
      
      refetch();
      
      toast({
        title: "API Key updated",
        description: "Your API key has been updated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to update API key",
        description: "There was an error updating your API key.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteApiKey = async () => {
    if (!selectedApiKey) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest({
        url: `/api/api-keys/${selectedApiKey.id}`,
        method: 'DELETE'
      });
      
      setIsConfirmDeleteOpen(false);
      
      refetch();
      
      toast({
        title: "API Key deleted",
        description: "Your API key has been deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to delete API key",
        description: "There was an error deleting your API key.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (apiKey: ApiKey) => {
    try {
      await apiRequest({
        url: `/api/api-keys/${apiKey.id}`,
        method: 'PATCH',
        data: {
          isActive: !apiKey.isActive
        }
      });
      
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to update API key",
        description: "There was an error updating your API key.",
        variant: "destructive"
      });
    }
  };

  const rotateApiKey = async (apiKey: ApiKey) => {
    try {
      // For demonstration, we're generating a fake key here
      // In a real app, you would rotate on the server with a secure method
      const newKey = `sk-${Math.random().toString(36).substring(2, 12)}`;
      
      await apiRequest({
        url: `/api/api-keys/${apiKey.id}/rotate`,
        method: 'PATCH',
        data: {
          key: newKey
        }
      });
      
      refetch();
      
      toast({
        title: "API Key rotated",
        description: "Your API key has been rotated successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to rotate API key",
        description: "There was an error rotating your API key.",
        variant: "destructive"
      });
    }
  };

  const ApiKeyItem = ({ apiKey }: { apiKey: ApiKey }) => {
    const usagePercentage = Math.min(100, Math.round((apiKey.quotaUsed / apiKey.quotaLimit) * 100));
    const isWarning = usagePercentage >= 80;
    
    return (
      <div key={apiKey.id} className="bg-[#1e2231] p-4 rounded-lg mb-3 border border-[#2a3146]">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{apiKey.name}</h3>
            <Badge className={apiKey.isActive ? "bg-green-600" : "bg-gray-600"}>
              {apiKey.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#2a3146]"
              onClick={() => openEditDialog(apiKey)}
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#2a3146]"
              onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
            >
              {copiedId === apiKey.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#2a3146]"
              onClick={() => rotateApiKey(apiKey)}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#2a3146] hover:bg-red-900/20 hover:text-red-400"
              onClick={() => openDeleteConfirm(apiKey)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex-1 mr-4">
            <div className="text-xs text-gray-400 mb-1">Key</div>
            <div className="font-mono text-xs bg-[#252a3a] p-2 rounded truncate">
              {apiKey.key && apiKey.key.length > 8 
                ? `${apiKey.key.substring(0, 8)}••••••••${apiKey.key.substring(apiKey.key.length - 4)}`
                : apiKey.key || 'No key available'}
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-2">
              <div className="text-xs text-gray-400 mb-1">Active</div>
              <Switch 
                checked={apiKey.isActive} 
                onCheckedChange={() => handleToggleActive(apiKey)}
              />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Quota Usage</span>
            <span className="text-xs font-medium">{apiKey.quotaUsed} / {apiKey.quotaLimit}</span>
          </div>
          <div className="h-2 rounded-full bg-[#252a3a] overflow-hidden">
            <div 
              className={`h-full rounded-full ${isWarning ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          {isWarning && (
            <div className="mt-2 flex items-center text-xs text-amber-400">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>Usage quota nearing limit</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-[#151827] border-[#1e2231] text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-indigo-400" />
          <CardTitle>API Keys</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Manage your API keys for YouTube and OpenAI integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="youtube" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          <TabsContent value="youtube" className="space-y-4">
            <div className="bg-[#1a1f2e] p-4 rounded-lg border border-[#2a3146]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">YouTube API Keys</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#2a3146]"
                  onClick={() => {
                    setNewApiKey({
                      ...newApiKey,
                      type: 'youtube',
                      quotaLimit: 10000
                    });
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Key
                </Button>
              </div>
              {youtubeApiKeys.length === 0 ? (
                <div className="text-center py-6">
                  <div className="mb-2 flex justify-center">
                    <div className="bg-[#252a3a] p-3 rounded-full">
                      <Key className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium mb-1">No YouTube API Keys</h3>
                  <p className="text-xs text-gray-400 mb-3">Add keys to use YouTube API features</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[#2a3146]"
                    onClick={() => {
                      setNewApiKey({
                        ...newApiKey,
                        type: 'youtube',
                        quotaLimit: 10000
                      });
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Your First Key
                  </Button>
                </div>
              ) : (
                <div>
                  {youtubeApiKeys.map(apiKey => (
                    <ApiKeyItem key={apiKey.id} apiKey={apiKey} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="openai" className="space-y-4">
            <div className="bg-[#1a1f2e] p-4 rounded-lg border border-[#2a3146]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">OpenAI API Keys</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#2a3146]"
                  onClick={() => {
                    setNewApiKey({
                      ...newApiKey,
                      type: 'openai',
                      quotaLimit: 100
                    });
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Key
                </Button>
              </div>
              {openaiApiKeys.length === 0 ? (
                <div className="text-center py-6">
                  <div className="mb-2 flex justify-center">
                    <div className="bg-[#252a3a] p-3 rounded-full">
                      <Key className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium mb-1">No OpenAI API Keys</h3>
                  <p className="text-xs text-gray-400 mb-3">Add keys to use AI-powered features</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[#2a3146]"
                    onClick={() => {
                      setNewApiKey({
                        ...newApiKey,
                        type: 'openai',
                        quotaLimit: 100
                      });
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Your First Key
                  </Button>
                </div>
              ) : (
                <div>
                  {openaiApiKeys.map(apiKey => (
                    <ApiKeyItem key={apiKey.id} apiKey={apiKey} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="other" className="space-y-4">
            <div className="bg-[#1a1f2e] p-4 rounded-lg border border-[#2a3146]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Other API Keys</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#2a3146]"
                  onClick={() => {
                    setNewApiKey({
                      ...newApiKey,
                      type: 'other',
                      quotaLimit: 1000
                    });
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Key
                </Button>
              </div>
              {otherApiKeys.length === 0 ? (
                <div className="text-center py-6">
                  <div className="mb-2 flex justify-center">
                    <div className="bg-[#252a3a] p-3 rounded-full">
                      <Key className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium mb-1">No Other API Keys</h3>
                  <p className="text-xs text-gray-400 mb-3">Add keys for additional integrations</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[#2a3146]"
                    onClick={() => {
                      setNewApiKey({
                        ...newApiKey,
                        type: 'other',
                        quotaLimit: 1000
                      });
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Your First Key
                  </Button>
                </div>
              ) : (
                <div>
                  {otherApiKeys.map(apiKey => (
                    <ApiKeyItem key={apiKey.id} apiKey={apiKey} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Add API Key Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="bg-[#1a1f2e] border-[#2a3146] text-white">
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the details for your new API key.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="My YouTube API Key"
                  className="bg-[#151827] border-[#2a3146]"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="key">API Key</Label>
                <Input
                  id="key"
                  placeholder="Enter your API key"
                  className="bg-[#151827] border-[#2a3146]"
                  value={newApiKey.key}
                  onChange={(e) => setNewApiKey({ ...newApiKey, key: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Key Type</Label>
                <Select
                  value={newApiKey.type}
                  onValueChange={(value) => setNewApiKey({ ...newApiKey, type: value })}
                >
                  <SelectTrigger className="bg-[#151827] border-[#2a3146]">
                    <SelectValue placeholder="Select key type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1f2e] border-[#2a3146] text-white">
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="vision">Google Vision</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quotaLimit">Quota Limit</Label>
                <Input
                  id="quotaLimit"
                  type="number"
                  placeholder="10000"
                  className="bg-[#151827] border-[#2a3146]"
                  value={newApiKey.quotaLimit}
                  onChange={(e) => setNewApiKey({ ...newApiKey, quotaLimit: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-400">Daily quota limit for this API key</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newApiKey.isActive}
                  onCheckedChange={(checked) => setNewApiKey({ ...newApiKey, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                className="border-[#2a3146]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddApiKey}
                disabled={!newApiKey.name || !newApiKey.key || isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Adding...
                  </>
                ) : (
                  <>Add Key</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit API Key Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#1a1f2e] border-[#2a3146] text-white">
            <DialogHeader>
              <DialogTitle>Edit API Key</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update the details for your API key.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="My YouTube API Key"
                  className="bg-[#151827] border-[#2a3146]"
                  value={editedApiKey.name}
                  onChange={(e) => setEditedApiKey({ ...editedApiKey, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-key">API Key</Label>
                <Input
                  id="edit-key"
                  placeholder="Enter your API key"
                  className="bg-[#151827] border-[#2a3146]"
                  value={editedApiKey.key}
                  onChange={(e) => setEditedApiKey({ ...editedApiKey, key: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-quotaLimit">Quota Limit</Label>
                <Input
                  id="edit-quotaLimit"
                  type="number"
                  placeholder="10000"
                  className="bg-[#151827] border-[#2a3146]"
                  value={editedApiKey.quotaLimit}
                  onChange={(e) => setEditedApiKey({ ...editedApiKey, quotaLimit: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-400">Daily quota limit for this API key</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editedApiKey.isActive}
                  onCheckedChange={(checked) => setEditedApiKey({ ...editedApiKey, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="border-[#2a3146]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditApiKey}
                disabled={!editedApiKey.name || !editedApiKey.key || isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
          <DialogContent className="bg-[#1a1f2e] border-[#2a3146] text-white">
            <DialogHeader>
              <DialogTitle>Delete API Key</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to delete this API key? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedApiKey && (
              <div className="py-4">
                <div className="flex items-center gap-2 p-3 bg-[#151827] rounded-lg border border-[#2a3146]">
                  <div className="font-medium">{selectedApiKey.name}</div>
                  <Badge className={selectedApiKey.isActive ? "bg-green-600" : "bg-gray-600"}>
                    {selectedApiKey.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="border-[#2a3146]"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteApiKey}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>Delete API Key</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter className="border-t border-[#1e2231] pt-4">
        <div className="text-xs text-gray-400">
          <p>Managing multiple API keys allows for automatic rotation when quota limits are reached.</p>
        </div>
      </CardFooter>
    </Card>
  );
}