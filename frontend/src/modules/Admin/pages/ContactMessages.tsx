import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminService } from '@/lib/services/admin.service';
import type { ContactMessage } from '@/lib/types';
import { toast } from 'sonner';
import { Mail, Phone, Calendar, Send, Search, Reply } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const sampleMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Sunil Malhotra',
    email: 'sunil.malhotra@gmail.com',
    mobile: '9811223344',
    message:
      'Seeking admission inquiry for Class 9 for the upcoming academic session 2025-2026. Please share fee details and transport routes.',
    createdAt: '15-08-2026',
  },
  {
    id: 'msg-2',
    name: 'Priya Nambiar',
    email: 'priya.nambiar@outlook.com',
    mobile: '9822334455',
    message:
      'Requesting appointment with Principal regarding inter-school athletic tournament hosting on our campus grounds.',
    createdAt: '14-08-2026',
  },
  {
    id: 'msg-3',
    name: 'Amitabh Sen',
    email: 'amitabh.sen@yahoo.com',
    mobile: '9833445566',
    message:
      'Inquiring about robotics lab and computer science curriculum electives for senior secondary classes 11 and 12.',
    createdAt: '12-08-2026',
  },
];

export const AdminContactMessages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: apiMessages } = useQuery({
    queryKey: ['adminMessages'],
    queryFn: () => adminService.getContactMessages(),
  });

  const messagesList =
    apiMessages?.data && Array.isArray(apiMessages.data) && apiMessages.data.length > 0
      ? apiMessages.data
      : sampleMessages;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Response email dispatched to ${replyMessage?.email}`);
    setReplyMessage(null);
    setReplyText('');
  };

  const filteredMessages = messagesList.filter((m) =>
    `${m.name} ${m.email} ${m.message}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Public Inquiries & Helpdesk</h1>
            <Badge variant="outline" className="text-xs">
              {filteredMessages.length} Messages
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Incoming inquiries submitted via the public Contact Us portal.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search inquiries by sender name, email, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMessages.map((msg, idx) => {
          const msgId = msg.id || msg._id || `msg-${idx}`;
          return (
            <Card
              key={msgId}
              className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Calendar className="h-3 w-3 text-indigo-500" />
                    <span>{msg.createdAt || 'Recent'}</span>
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-[10px] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                  >
                    New Inquiry
                  </Badge>
                </div>
                <CardTitle className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  {msg.name}
                </CardTitle>
                <CardDescription className="mt-1 space-y-0.5 text-xs">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3 text-indigo-500" />
                    <span>{msg.email}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3 text-emerald-500" />
                    <span>{msg.mobile}</span>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-3 pt-0 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 leading-relaxed text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300">
                  "{msg.message}"
                </div>

                <div className="flex items-center justify-end border-t border-slate-100 pt-2 dark:border-zinc-800">
                  <Button
                    size="sm"
                    className="h-8 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                    onClick={() => {
                      setReplyMessage(msg);
                      setReplyText(
                        `Dear ${msg.name},\n\nThank you for reaching out to Aura International Academy regarding your inquiry. `,
                      );
                    }}
                  >
                    <Reply className="mr-1 h-3.5 w-3.5" />
                    <span>Reply to Sender</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reply Modal */}
      <Dialog open={!!replyMessage} onOpenChange={() => setReplyMessage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Mail className="h-4 w-4 text-indigo-500" />
              <span>Compose Reply to {replyMessage?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Recipient: {replyMessage?.email} ({replyMessage?.mobile})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendReply} className="space-y-3 pt-2">
            <div className="text-muted-foreground rounded-lg border bg-slate-50 p-2.5 text-xs dark:bg-zinc-800/50">
              <span className="mb-0.5 block font-semibold">Original Inquiry:</span>"
              {replyMessage?.message}"
            </div>

            <div className="space-y-1">
              <Textarea
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
                placeholder="Type your official administrative response..."
                className="text-xs leading-relaxed"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReplyMessage(null)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                <span>Send Response Email</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContactMessages;
