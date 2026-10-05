import type { Metadata } from "next";
import { PageHead } from "@/components/kit";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

// Draft written from how the app actually handles data. Have counsel review before launch.
export default function Privacy() {
  const mail = <a href={`mailto:${SITE.supportEmail}`} className="underline">{SITE.supportEmail}</a>;
  return (
    <article>
      <PageHead labels={["(Privacy)", `Updated ${SITE.legalUpdated}`]} title="Privacy policy.">
        What we collect when you use {SITE.name}, why, and how to have it removed.
      </PageHead>

      <h2>Who we are</h2>
      <p>{SITE.name} is run by {SITE.legalName}, {SITE.address}. We are the controller of the personal data described here. Contact us at {mail}.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account details.</strong> When you sign in with Google we receive your name, email address and profile picture. We don&apos;t receive your Google password.</li>
        <li><strong>Your footage.</strong> The video and audio files you upload, and the edits, timelines and shot lists made from them. Footage can show and record other people. You must have their permission to upload it.</li>
        <li><strong>Edit history.</strong> For each edit: its ID, title, the settings you chose and when you started it.</li>
        <li><strong>Technical data.</strong> Server logs with IP address, browser and request times, kept to run and secure the service.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To provide the service you asked for: storing uploads, editing and rendering them, and giving you the results (contract).</li>
        <li>To keep the service secure and fair, including daily usage limits (legitimate interest).</li>
        <li>To answer you when you contact us (legitimate interest).</li>
      </ul>
      <p>We don&apos;t sell your data, show ads, or use your footage to train models.</p>

      <h2>Who processes it</h2>
      <ul>
        <li><strong>Google</strong>, for sign-in.</li>
        <li><strong>EngineX</strong>, which holds uploads while they are edited and runs the GPU editing.</li>
        <li><strong>Supabase</strong>, which stores your edit history and your finished videos and timelines.</li>
        <li><strong>Vercel</strong>, which hosts and serves the site.</li>
      </ul>
      <p>These providers may process data outside your country. Where required, transfers are covered by standard contractual clauses.</p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Raw uploaded footage: deleted automatically after {SITE.retentionDays} days.</li>
        <li>Finished videos, timelines and edit history: until you delete them from your account page or ask us to.</li>
        <li>Server logs: up to 30 days.</li>
      </ul>

      <h2>Cookies and storage</h2>
      <p>
        We set one essential cookie to keep you signed in. The site also uses your browser&apos;s session storage to remember upload progress
        and playback position in the current tab. It is cleared when you close the tab. We don&apos;t use analytics or advertising cookies.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you can ask to access, correct, delete or export your data, or object to how we use it. Delete your edits
        and their files any time from your account page. For anything else, email {mail} and we&apos;ll reply within 30 days. You can also complain to
        your local data protection authority.
      </p>

      <h2>Children</h2>
      <p>{SITE.name} is not meant for anyone under 16, and we don&apos;t knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>If we change this policy in a way that matters, we&apos;ll update the date above and tell signed-in users before it takes effect.</p>
    </article>
  );
}
