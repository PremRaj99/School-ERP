import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { contactService } from '@/lib/services/contact.service';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import {
  PiEnvelopeSimple,
  PiPhone,
  PiMapPin,
  PiClock,
  PiPaperPlaneTilt,
  PiChatCircleText,
  PiQuestion,
} from 'react-icons/pi';

export const ContactPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactService.submitContact(formData);
      toast.success('Your inquiry has been submitted successfully! We will reach out shortly.');
      setFormData({ name: '', email: '', mobile: '', message: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <Badge variant="outline" className="text-primary text-xs">
          Get In Touch
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Contact Administration & Admissions
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Have questions regarding student admissions, curriculum, fee structure, or campus visits?
          Send us a message and our administrative desk will respond promptly.
        </p>
      </div>

      {/* Dual Column Content */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: Campus Info & FAQ */}
        <div className="space-y-6 lg:col-span-5">
          {/* Campus Details Card */}
          <Card className="border border-slate-200/80 bg-white/90 shadow-md dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <PiMapPin className="text-primary h-4 w-4" />
                <span>Campus & Office Information</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Visit our campus during official visiting hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-start gap-3 rounded-md bg-slate-50 p-3 dark:bg-zinc-800/50">
                <PiMapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    Main Campus Address
                  </span>
                  <p className="text-muted-foreground mt-0.5">
                    Naya Savera Parivar Office, Duhatand, Dhanbad, Jharkhand, 826001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md bg-slate-50 p-3 dark:bg-zinc-800/50">
                <PiPhone className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    Phone Helpline
                  </span>
                  <p className="text-muted-foreground mt-0.5">+91 6200103129</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md bg-slate-50 p-3 dark:bg-zinc-800/50">
                <PiEnvelopeSimple className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    Email Desk
                  </span>
                  <p className="text-muted-foreground mt-0.5">web.premraj@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md bg-slate-50 p-3 dark:bg-zinc-800/50">
                <PiClock className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    Office Working Hours
                  </span>
                  <p className="text-muted-foreground mt-0.5">Monday – Friday: 8:00 AM – 4:30 PM</p>
                  <p className="text-muted-foreground">
                    Saturday: 8:30 AM – 1:30 PM (Closed on Sunday)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick FAQ Accordion */}
          <Card className="border border-slate-200/80 bg-white/90 shadow-md dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <PiQuestion className="text-primary h-4 w-4" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion className="w-full text-xs">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold">
                    How do I receive student login credentials?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-xs leading-relaxed">
                    Student credentials are automatically generated upon confirmed admission and
                    sent via SMS and Email to the registered parent mobile number.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold">
                    Can fees be paid online through the portal?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-xs leading-relaxed">
                    Yes, parents and students can access the Fees module in the Student Portal to
                    review monthly invoices and complete digital payments with instant receipts.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="py-2.5 text-xs font-semibold">
                    How are exam results and report cards published?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-xs leading-relaxed">
                    Once teachers complete marks entry and the administration officially declares
                    results, students can view and download term-end marksheets in their portal.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Inquiry Submission Form */}
        <div className="lg:col-span-7">
          <Card className="border border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader>
              <div className="text-primary inline-flex items-center gap-2 text-xs font-semibold">
                <PiChatCircleText className="h-3.5 w-3.5" />
                <span>Direct Inquiry Form</span>
              </div>
              <CardTitle className="text-xl font-bold">Send Us a Direct Message</CardTitle>
              <CardDescription className="text-xs">
                Fill out your details below and our administration desk will reach out within 24
                hours.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">
                      Your Full Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Ramesh Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">
                      Email Address <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mobile" className="text-xs font-semibold">
                    10-Digit Mobile Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    pattern="[6-9][0-9]{9}"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-9 text-xs"
                  />
                  <p className="text-muted-foreground text-[10px]">
                    Indian 10-digit mobile number starting with 6, 7, 8, or 9
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-semibold">
                    Inquiry Message / Query <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Please specify your query in detail (admission class, academic questions, transportation, etc.)..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="text-xs leading-relaxed"
                  />
                </div>
              </CardContent>

              <CardFooter className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-2 dark:border-zinc-800">
                <p className="text-muted-foreground text-[11px]">
                  Your contact info is strictly confidential.
                </p>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary h-9 px-5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
                >
                  {loading ? (
                    'Submitting...'
                  ) : (
                    <>
                      <PiPaperPlaneTilt className="mr-1.5 h-3.5 w-3.5" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
