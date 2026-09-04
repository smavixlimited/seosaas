import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Mail, MessageSquare, Send } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { MarketingNavbar } from "@/client/marketing/Navbar";
import { MarketingFooter } from "@/client/marketing/Footer";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary selection:text-white">
      <MarketingNavbar />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-base-content">
              We're Here to Help You Rank
            </h1>
            <p className="text-base sm:text-lg text-base-content/70 max-w-xl mx-auto">
              Have questions about enterprise data limits, agency white-labeling, or API access? Reach out directly.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6 md:col-span-1">
              <div className="rounded-2xl border border-base-300 bg-base-100 p-6 space-y-3">
                <Mail className="h-6 w-6 text-primary" />
                <h3 className="text-base font-bold text-base-content">Support & Inquiries</h3>
                <p className="text-xs text-base-content/70">
                  <a href={`mailto:${BRAND_CONFIG.supportEmail}`} className="link link-primary">
                    {BRAND_CONFIG.supportEmail}
                  </a>
                </p>
              </div>

              <div className="rounded-2xl border border-base-300 bg-base-100 p-6 space-y-3">
                <MessageSquare className="h-6 w-6 text-secondary" />
                <h3 className="text-base font-bold text-base-content">Sales & Enterprise</h3>
                <p className="text-xs text-base-content/70">
                  <a href={`mailto:${BRAND_CONFIG.salesEmail}`} className="link link-secondary">
                    {BRAND_CONFIG.salesEmail}
                  </a>
                </p>
              </div>
            </div>

            <div className="md:col-span-2 rounded-3xl border border-base-300 bg-base-100 p-8 shadow-sm">
              {submitted ? (
                <div className="text-center space-y-4 py-8">
                  <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-base-content">Message Received!</h3>
                  <p className="text-sm text-base-content/70">
                    Thank you {name}. A member of our team will respond to {email} within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="input input-bordered w-full rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="input input-bordered w-full rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help your team?"
                      className="textarea textarea-bordered w-full rounded-xl text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full rounded-xl font-bold text-white bg-primary hover:bg-primary/90 border-none"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Send Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
