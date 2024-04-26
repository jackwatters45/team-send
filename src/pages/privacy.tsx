import Layout from "@/layouts/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="mx-auto max-w-screen-md space-y-8 px-8 py-8 leading-relaxed sm:px-16 md:py-12 xl:py-16">
        <h1 className="lg:leading-tighter pb-2 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
          Privacy Policy
        </h1>
        <p className="pb-3">
          This Privacy Policy outlines how we collect, use, and protect your
          personal information when you use our website. By using our website,
          you consent to the practices described in this policy.
        </p>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p>
            We may collect personal information from you when you interact with
            our website, such as when you register an account, fill out a form,
            or make a purchase. The types of information we may collect include:
            <ul className="list-disc pl-6">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Payment information</li>
              <li>Other information you provide voluntarily</li>
            </ul>
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="mb-2 text-2xl font-semibold">
            2. How We Use Your Information
          </h2>
          <p className="mb-4">
            We may use the information we collect from you for the following
            purposes:
            <ul className="list-disc pl-6">
              <li>To process transactions</li>
              <li>To personalize your experience</li>
              <li>To improve our website</li>
              <li>To respond to your inquiries</li>
              <li>To comply with legal obligations</li>
            </ul>
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="mb-2 text-2xl font-semibold">
            3. How We Protect Your Information
          </h2>
          <p className="mb-4">
            We implement a variety of security measures to maintain the safety
            of your personal information when you enter, submit, or access your
            information. However, no method of transmission over the internet or
            electronic storage is completely secure, so we cannot guarantee
            absolute security.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="mb-2 text-2xl font-semibold">
            4. Disclosure of Information to Third Parties
          </h2>
          <p className="mb-4">
            We do not sell, trade, or otherwise transfer your personal
            information to outside parties. This does not include trusted third
            parties who assist us in operating our website, conducting our
            business, or servicing you, as long as those parties agree to keep
            this information confidential. We may also release your information
            when we believe release is appropriate to comply with the law,
            enforce our site policies, or protect ours or others&apos; rights,
            property, or safety.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="mb-2 text-2xl font-semibold">5. Your Consent</h2>
          <p className="mb-4">
            By using our website, you consent to our Privacy Policy.
          </p>
        </div>
      </div>
    </Layout>
  );
}
