
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Search, Send, MessageSquare, MoreVertical } from "lucide-react";
import { useConversations, useMessages } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { messages, sendMessage, isLoading: messagesLoading } = useMessages(selectedConversation);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      try {
        await sendMessage.mutateAsync({ content: newMessage.trim() });
        setNewMessage("");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const participantName = conv.participant_profile 
      ? `${conv.participant_profile.first_name || ''} ${conv.participant_profile.last_name || ''}`.trim()
      : conv.group_name || 'Unknown';
    return participantName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">Communicate with your lab team</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <CardTitle>Conversations</CardTitle>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {conversationsLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No conversations yet</div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {filteredConversations.map((conversation) => {
                  const participantName = conversation.participant_profile 
                    ? `${conversation.participant_profile.first_name || ''} ${conversation.participant_profile.last_name || ''}`.trim() || conversation.participant_profile.email
                    : conversation.group_name || 'Unknown';
                  
                  const initials = conversation.participant_profile
                    ? `${conversation.participant_profile.first_name?.[0] || ''}${conversation.participant_profile.last_name?.[0] || ''}`.toUpperCase() || conversation.participant_profile.email[0].toUpperCase()
                    : (conversation.group_name?.[0] || 'U').toUpperCase();

                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation === conversation.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.participant_profile?.avatar_url || undefined} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm truncate">
                              {participantName}
                              {conversation.is_group && (
                                <Badge variant="outline" className="ml-2">Group</Badge>
                              )}
                            </h3>
                            {conversation.last_message_at && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.last_message || 'No messages yet'}
                          </p>
                        </div>
                        {conversation.unread_count > 0 && (
                          <Badge className="bg-primary text-primary-foreground">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConv.participant_profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {selectedConv.participant_profile
                          ? `${selectedConv.participant_profile.first_name?.[0] || ''}${selectedConv.participant_profile.last_name?.[0] || ''}`.toUpperCase() || selectedConv.participant_profile.email[0].toUpperCase()
                          : (selectedConv.group_name?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConv.participant_profile 
                          ? `${selectedConv.participant_profile.first_name || ''} ${selectedConv.participant_profile.last_name || ''}`.trim() || selectedConv.participant_profile.email
                          : selectedConv.group_name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConv.participant_profile?.email || ''}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                        >
                          {!isOwn && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedConv.participant_profile?.avatar_url || undefined} />
                              <AvatarFallback>
                                {selectedConv.participant_profile
                                  ? `${selectedConv.participant_profile.first_name?.[0] || ''}${selectedConv.participant_profile.last_name?.[0] || ''}`.toUpperCase()
                                  : 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-xs lg:max-w-md ${isOwn ? "text-right" : ""}`}>
                            <div
                              className={`p-3 rounded-lg ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sendMessage.isPending}
                  />
                  <Button onClick={handleSendMessage} size="sm" disabled={!newMessage.trim() || sendMessage.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
