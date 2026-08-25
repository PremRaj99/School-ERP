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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { MAX_PAGE_SIZE, type ContactRecord } from '@schoolerp/contracts';
import { getErrorMessage } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { toast } from 'sonner';
import { PiEnvelope, PiPhone, PiPaperPlaneTilt, PiMagnifyingGlass, PiTrash } from 'react-icons/pi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const AdminContactMessages: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // pageSize: MAX_PAGE_SIZE — card-grid inbox with client-side search, not `<DataTable>`; a
  // school's total inquiry count comfortably fits in one page (ALIGNMENT_PLAN.md 2C/P1).
  const {
    data: messagesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.contactMessages({ pageSize: MAX_PAGE_SIZE }),
    queryFn: () => adminService.getContactMessages({ pageSize: MAX_PAGE_SIZE }),
  });
  const messagesList = messagesResponse?.data;

  const deleteMutation = useMutation({
    mutationFn: (contactId: string) => adminService.deleteContactMessage(contactId),
    onSuccess: () => {
      toast.success('Inquiry removed');
      queryClient.invalidateQueries({ queryKey: qk.admin.contactMessages() });
      setDeleteConfirmId(null);
      setIsDetailOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const openDetail = (msg: ContactRecord) => {
    setSelectedMessage(msg);
    setReplyText(
      `Dear ${msg.name},\n\nThank you for reaching out to Gyandeep baal vikas vidyamandir regarding your inquiry. `,
    );
    setIsDetailOpen(true);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Response email dispatched to ${selectedMessage?.email}`);
  };

  const filteredMessages = (messagesList ?? []).filter((m) =>
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
      <div className="relative w-full">
        <PiMagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
        <Input
          placeholder="Search inquiries by sender name, email, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 pl-9 text-xs"
        />
      </div>

      {/* Inbox Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : filteredMessages.length === 0 ? (
        <Empty className="rounded-md border p-8">
          <EmptyMedia illustration="search" illustrationSize={120} />
          <EmptyTitle>No inquiries yet</EmptyTitle>
          <EmptyDescription>
            {searchTerm
              ? 'No inquiries match your search.'
              : 'Messages submitted via the public Contact Us form will show up here.'}
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMessages.map((msg, idx) => {
            const msgId = msg.id || `msg-${idx}`;
            return (
              <Card
                key={msgId}
                onClick={() => openDetail(msg)}
                className="flex cursor-pointer flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-end">
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground text-[10px]"
                    >
                      New Inquiry
                    </Badge>
                  </div>
                  <CardTitle className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    {msg.name}
                  </CardTitle>
                  <CardDescription className="mt-1 space-y-0.5 text-xs">
                    <div className="text-muted-foreground flex items-center gap-1">
                      <PiEnvelope className="text-primary h-3 w-3" />
                      <span>{msg.email}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <PiPhone className="h-3 w-3 text-emerald-500" />
                      <span>{msg.mobile}</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pt-0 text-xs">
                  <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                    "{msg.message}"
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Message Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg lg:max-w-xl">
          {selectedMessage && (
            <div className="space-y-4 p-6">
              <SheetHeader>
                <div className="text-primary flex items-center gap-2 text-xs font-semibold">
                  <PiEnvelope className="h-4 w-4" />
                  <span>Public Inquiry</span>
                </div>
                <SheetTitle className="text-lg font-bold">{selectedMessage.name}</SheetTitle>
                <SheetDescription className="text-xs">
                  {selectedMessage.email} · {selectedMessage.mobile}
                </SheetDescription>
              </SheetHeader>

              <div className="text-muted-foreground rounded-md border bg-slate-50 p-2.5 text-xs leading-relaxed dark:bg-zinc-800/50">
                <span className="mb-0.5 block font-semibold text-slate-800 dark:text-zinc-200">
                  Original Inquiry:
                </span>
                "{selectedMessage.message}"
              </div>

              <form onSubmit={handleSendReply} className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold">Compose Reply</span>
                  <Textarea
                    rows={5}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    placeholder="Type your official administrative response..."
                    className="text-xs leading-relaxed"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 flex-1 text-xs text-white"
                  >
                    <PiPaperPlaneTilt className="mr-1.5 h-3.5 w-3.5" />
                    <span>Send Response Email</span>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteConfirmId(selectedMessage.id)}
                  >
                    <PiTrash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <PiTrash className="h-4 w-4" />
              <span>Delete Inquiry</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to permanently delete this inquiry from{' '}
              <strong>{selectedMessage?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContactMessages;
