import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { containsContactInfo } from "@/lib/contactFilter";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Send, ArrowLeft, Loader2 } from "lucide-react";

const MessagesPage = () => {
  const { user, role } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    let query = supabase.from("assignments").select("*").not("agent_id", "is", null);
    if (role === "student") query = query.eq("student_id", user!.id);
    else if (role === "agent") query = query.eq("agent_id", user!.id);

    const { data } = await query.order("updated_at", { ascending: false });
    setAssignments(data || []);

    if (data && data.length > 0) {
      const userIds = [...new Set(data.flatMap(a => [a.student_id, a.agent_id].filter(Boolean)))];
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", userIds);
      const map: Record<string, any> = {};
      profs?.forEach(p => { map[p.user_id] = p; });
      setProfiles(map);
    }
    setLoading(false);
  };

  const selectConversation = async (assignmentId: string) => {
    setSelectedId(assignmentId);
    const { data } = await supabase.from("messages").select("*")
      .eq("assignment_id", assignmentId).order("created_at");
    setMessages(data || []);

    const channel = supabase
      .channel(`msg-${assignmentId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `assignment_id=eq.${assignmentId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedId) return;
    if (containsContactInfo(newMessage)) {
      toast({ title: "Contact sharing blocked", description: "Sharing phone numbers, emails, or social handles is not allowed in messages.", variant: "destructive" });
      return;
    }
    await supabase.from("messages").insert({
      assignment_id: selectedId, sender_id: user!.id, content: newMessage.trim(),
    });
    setNewMessage("");
  };

  const selectedAssignment = assignments.find(a => a.id === selectedId);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto page-enter">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold">Messages</h2>
        <p className="text-muted-foreground text-sm">Chat with students and agents on active assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
        {/* Conversation List */}
        <Card className={`border-border overflow-hidden ${selectedId ? "hidden md:block" : ""}`} style={{ boxShadow: "var(--card-shadow)" }}>
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2 font-heading">
              <MessageSquare className="h-4 w-4 text-primary" /> Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-310px)]">
            {assignments.length === 0 ? (
              <div className="py-12 text-center px-4">
                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
              </div>
            ) : (
              assignments.map((a) => {
                const otherUserId = role === "student" ? a.agent_id : a.student_id;
                const other = profiles[otherUserId];
                return (
                  <div
                    key={a.id}
                    className={`px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-secondary/30 transition-colors ${
                      selectedId === a.id ? "bg-secondary/50 border-l-2 border-l-primary" : ""
                    }`}
                    onClick={() => selectConversation(a.id)}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={other?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                          {(other?.full_name || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-medium truncate">{a.title}</p>
                          <Badge variant="outline" className="text-[10px] shrink-0 capitalize ml-2">
                            {a.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {role === "student" ? "Agent" : "Student"}: {other?.full_name || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className={`border-border md:col-span-2 flex flex-col overflow-hidden ${!selectedId ? "hidden md:flex" : "flex"}`}
          style={{ boxShadow: "var(--card-shadow)" }}>
          {selectedId && selectedAssignment ? (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-8 w-8" onClick={() => setSelectedId(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{selectedAssignment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {role === "student" ? "Agent" : "Student"}: {profiles[role === "student" ? selectedAssignment.agent_id : selectedAssignment.student_id]?.full_name || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                  </div>
                )}
                {messages.map((m: any) => {
                  const isMe = m.sender_id === user?.id;
                  const sender = profiles[m.sender_id];
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {!isMe && (
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={sender?.avatar_url || undefined} />
                            <AvatarFallback className="bg-secondary text-[10px]">
                              {(sender?.full_name || "U").slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-secondary text-secondary-foreground rounded-bl-md"
                        }`}>
                          {!isMe && (
                            <p className="text-[10px] font-semibold mb-0.5 opacity-70">
                              {sender?.full_name || "Unknown"}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                          <p className="text-[10px] opacity-50 mt-1 text-right">
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    maxLength={1000}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="icon" disabled={!newMessage.trim()} className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
