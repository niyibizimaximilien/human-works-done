import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, AlertTriangle, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { containsContactInfo, sanitizeMessage } from "@/lib/contactFilter";

interface AssignmentChatProps {
  assignmentId: string;
  otherUserProfile?: { full_name?: string; avatar_url?: string } | null;
}

const AssignmentChat = ({ assignmentId, otherUserProfile }: AssignmentChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!assignmentId || !user) return;
    fetchMessages();

    const channel = supabase
      .channel(`chat-${assignmentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `assignment_id=eq.${assignmentId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assignmentId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
    scrollToBottom();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !user) return;

    if (containsContactInfo(text)) {
      const sanitized = sanitizeMessage(text);
      setNewMessage(sanitized);
      toast({
        title: "Contact info removed",
        description:
          "Phone numbers, emails, and social handles were removed for your safety. All communication must stay in-app.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      assignment_id: assignmentId,
      sender_id: user.id,
      content: text,
    });

    if (error) {
      toast({
        title: "Failed to send",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewMessage("");
    }
    setSending(false);
  };

  const otherInitials = (otherUserProfile?.full_name || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-card">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="text-sm font-heading font-semibold">Chat</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {messages.length} messages
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[300px] min-h-[150px]"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
              >
                {!isMe && (
                  <Avatar className="h-6 w-6 shrink-0 mt-1">
                    <AvatarImage
                      src={otherUserProfile?.avatar_url || undefined}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-[8px]">
                      {otherInitials}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <p
                    className={`text-[9px] mt-1 ${
                      isMe
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-3 py-2 border-t border-border bg-card/50 flex items-center gap-1">
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground px-1">
          <AlertTriangle className="h-3 w-3" />
          No contacts
        </div>
      </div>

      <form
        onSubmit={handleSend}
        className="px-3 pb-3 flex items-center gap-2"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          maxLength={1000}
          disabled={sending}
          className="flex-1 h-9 text-sm"
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending || !newMessage.trim()}
          className="h-9 w-9 shrink-0 gold-glow"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default AssignmentChat;
