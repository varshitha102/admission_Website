import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Book, MessageCircle, Mail, Phone, FileText, Video, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    question: 'How do I create a new lead?',
    answer: 'Navigate to the Leads page and click the "Add Lead" button. Fill in the required information including name, email, and phone number. You can also assign the lead to a specific team member and set the source.',
  },
  {
    question: 'How does the lead pipeline work?',
    answer: 'The lead pipeline consists of 5 stages: Inquiry, Lead, Application, Admission, and Enrollment. Leads progress through these stages as they move closer to enrollment. You can change a lead\'s stage by clicking on it and selecting the new stage.',
  },
  {
    question: 'How do I convert a lead to an application?',
    answer: 'When a lead is ready to apply, open the lead details and click "Convert to Application". This will create a new application record and move the lead to the Application stage.',
  },
  {
    question: 'What are tasks and how do I use them?',
    answer: 'Tasks are follow-up reminders and activities. You can create tasks for yourself or assign them to team members. Tasks can be linked to specific leads and have due dates and priorities.',
  },
  {
    question: 'How do I generate reports?',
    answer: 'Go to the Reports page to view various analytics including conversion rates, source performance, and team productivity. You can filter reports by date range and export data if needed.',
  },
  {
    question: 'What user roles are available?',
    answer: 'The system has 6 roles: Admin (full access), Team Lead (team oversight), Executive (assigned leads), Consultant (early stage leads), Publisher (submit leads), and Digital Manager (marketing analytics).',
  },
];

const resources = [
  {
    title: 'Getting Started Guide',
    description: 'Learn the basics of using the CRM',
    icon: Book,
    link: '#',
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step video guides',
    icon: Video,
    link: '#',
  },
  {
    title: 'Documentation',
    description: 'Detailed API and feature documentation',
    icon: FileText,
    link: '#',
  },
];

export function Help() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-500">Find answers and get support</p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-sm text-gray-500">Available 9am - 5pm</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm text-gray-500">Response within 24h</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Phone Support</h3>
                <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Call Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>Helpful guides and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <a
                key={resource.title}
                href={resource.link}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <resource.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium">{resource.title}</h4>
                  <p className="text-sm text-gray-500">{resource.description}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions and answers</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
