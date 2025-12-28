import { HelpCircle, Book, MessageCircle, Video, Mail, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I create a new exam?',
    answer: 'Navigate to the Exams page and click on "Create Exam". Fill in the exam details including title, type, duration, and add questions. You can choose from multiple question types including MCQ, Likert scale, and image-based questions.'
  },
  {
    question: 'How do I assign exams to candidates?',
    answer: 'Go to the Assignments page and click "Create Assignment". Select the exam you want to assign, choose the candidates or group, set the start and end dates, and save the assignment.'
  },
  {
    question: 'Can I bulk import questions?',
    answer: 'Yes! When editing an exam, you can use the bulk import feature to upload questions from a CSV or Excel file. The system will validate the format and show you a preview before importing.'
  },
  {
    question: 'How are behavioral assessments scored?',
    answer: 'Behavioral assessments use Likert scale scoring. Each response is mapped to a numerical value (1-5), and trait scores are calculated based on the responses. Reverse scoring is applied where applicable.'
  },
  {
    question: 'How do I view candidate results?',
    answer: 'Navigate to the Reports page to view comprehensive analytics. You can filter by exam, group, or individual candidate. Detailed result breakdowns are available including trait analysis and career fitment.'
  },
];

const resources = [
  { icon: Book, title: 'Documentation', description: 'Comprehensive guides and tutorials', link: '#' },
  { icon: Video, title: 'Video Tutorials', description: 'Step-by-step video walkthroughs', link: '#' },
  { icon: MessageCircle, title: 'Community Forum', description: 'Connect with other administrators', link: '#' },
  { icon: Mail, title: 'Email Support', description: 'Get help from our support team', link: '#' },
];

export default function HelpPage() {
  return (
    <AdminLayout 
      title="Help & Support" 
      subtitle="Find answers and get assistance"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl font-bold text-foreground">How can we help?</h2>
                <p className="text-muted-foreground text-sm">Search our knowledge base or browse FAQs</p>
              </div>
            </div>
            <div className="mt-4">
              <Input placeholder="Search for help..." className="w-full" />
            </div>
          </Card>

          {/* FAQs */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-foreground">Resources</h3>
          {resources.map((resource) => (
            <Card key={resource.title} variant="glass" className="p-4 hover-lift cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <resource.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{resource.title}</h4>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          ))}

          <Card variant="glass" className="p-6 bg-gradient-primary text-white mt-6">
            <h4 className="font-bold text-lg mb-2">Need more help?</h4>
            <p className="text-white/80 text-sm mb-4">
              Our support team is available 24/7 to assist you with any questions.
            </p>
            <Button variant="secondary" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
