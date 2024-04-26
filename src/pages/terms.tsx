import Layout from "@/layouts/Layout";

export default function TernsOfService() {
  return (
    <Layout>
      <div className="mx-auto max-w-screen-md space-y-8 px-8 py-8 leading-relaxed sm:px-16 md:py-12 xl:py-16">
        <h1 className="lg:leading-tighter pb-2 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
          Terms of Service
        </h1>
        <p className="pb-3">
          Welcome to our website. By accessing or using our website, you agree
          to comply with and be bound by the following terms and conditions of
          use. Please read these terms carefully before using our website.
        </p>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our website, you agree to be bound by these
            Terms of Service, all applicable laws and regulations, and agree
            that you are responsible for compliance with any applicable local
            laws.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">2. User Responsibilities</h2>
          <p>
            You agree to use our website only for lawful purposes and in a way
            that does not infringe the rights of, restrict, or inhibit anyone
            else&apos;s use and enjoyment of the website.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">3. Prohibited Activities</h2>
          <p>
            You are prohibited from engaging in any unlawful or prohibited
            activity while using our website, including but not limited to:
            <ul className="list-disc pl-6">
              <li>
                Posting or transmitting any unlawful, threatening, defamatory,
                obscene, or otherwise objectionable content.
              </li>
              <li>
                Impersonating any person or entity, or falsely stating or
                otherwise misrepresenting your affiliation with a person or
                entity.
              </li>
              <li>
                Attempting to gain unauthorized access to any portion of the
                website, or any systems or networks connected to the website, by
                hacking, password &apo;mining&apo; or any other illegitimate
                means.
              </li>
            </ul>
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            4. Intellectual Property Rights
          </h2>
          <p>
            The content on our website, including but not limited to text,
            graphics, logos, images, and software, is the property of our
            company and is protected by intellectual property laws. You may not
            use, reproduce, distribute, or create derivative works based on this
            content without explicit permission from us.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">5. Content Policy</h2>
          <p>
            Users are solely responsible for the content they post on our
            website. We reserve the right to remove any content that violates
            these terms of service or is otherwise objectionable. By posting
            content on our website, you grant us a non-exclusive, royalty-free,
            perpetual, irrevocable, and fully sub-licensable right to use,
            reproduce, modify, adapt, publish, translate, create derivative
            works from, distribute, and display such content throughout the
            world in any media.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
          <p>
            We reserve the right to update or modify these Terms of Service at
            any time without prior notice. Your continued use of the website
            after any such changes constitutes your acceptance of the new Terms
            of Service.
          </p>
        </div>
      </div>
    </Layout>
  );
}
