import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/kit";
import { RUNS_PER_DAY, SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of service" };

// Draft. Have counsel review before launch, especially liability and governing law.
export default function Terms() {
  const mail = <a href={`mailto:${SITE.supportEmail}`} className="underline">{SITE.supportEmail}</a>;
  return (
    <article>
      <PageHead labels={["(Terms)", `Updated ${SITE.legalUpdated}`]} title="Terms of service.">
        The agreement between you and {SITE.legalName} when you use {SITE.name}.
      </PageHead>

      <h2>Using the service</h2>
      <p>
        By signing in you agree to these terms. You must be at least 16 and able to enter a contract. You&apos;re responsible for activity on
        your account, so keep access to your Google account secure.
      </p>

      <h2>Your content</h2>
      <p>
        You keep all rights to the footage you upload and the edits made from it. You give us permission to store, process and render it only
        to provide the service to you. That permission ends when the files are deleted.
      </p>
      <p>
        You confirm you have the rights to everything you upload, including consent from the people who appear in it. Don&apos;t upload content
        that is illegal, infringes anyone&apos;s rights, or that you aren&apos;t allowed to share.
      </p>

      <h2>Fair use and limits</h2>
      <p>
        The free plan allows {RUNS_PER_DAY} edits a day. Don&apos;t try to get around limits, overload the service, access other people&apos;s
        edits, or use it to build a competing product. We may suspend accounts that do.
      </p>

      <h2>Paid plans</h2>
      <p>
        Prices are shown on the <Link href="/pricing" className="underline">pricing page</Link>. Paid plans renew monthly until cancelled, and
        cancelling keeps the plan until the end of the paid period. Fees are non-refundable except where the law requires otherwise.
      </p>

      <h2>Files and availability</h2>
      <p>
        Uploads and rendered files are deleted after {SITE.retentionDays} days, so download what you want to keep. We work to keep the service
        running but don&apos;t guarantee it will always be available or that every edit will finish.
      </p>

      <h2>Disclaimers and liability</h2>
      <p>
        The service is provided &quot;as is&quot;. To the extent the law allows, we aren&apos;t liable for indirect or consequential losses, and our total
        liability is limited to what you paid us in the 12 months before the claim, or USD 100 if you use the free plan.
      </p>

      <h2>Ending the agreement</h2>
      <p>
        You can stop using the service and delete your edit history any time from your account page. We may end or suspend access if you
        break these terms, with notice where reasonable.
      </p>

      <h2>Changes and law</h2>
      <p>
        We may update these terms and will tell signed-in users about material changes before they take effect. These terms are governed by
        the laws of {SITE.jurisdiction}. Questions: {mail}.
      </p>
    </article>
  );
}
