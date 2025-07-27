import React from "react";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-10">
    <h2 className="text-2xl font-semibold text-primary mb-3">{title}</h2>
    <div className="text-gray-700 text-sm leading-relaxed">{children}</div>
  </div>
);

const PoliciesPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Study Connect Policies
      </h1>

      <Section title="Terms and Conditions">
        <p>
          By using Study Connect, you agree to follow all applicable academic
          and legal regulations. All Materials on Study Connect are either open-sourced or copyrighted. We reserve the right to suspend accounts found
          misusing the platform.
        </p>
      </Section>

      <Section title="Return and Refund Policy">
        <p>
          All payments made on Study Connect are final and non-refundable. Users
          can cancel their subscription at any time, and premium benefits will
          remain active until the end of the current billing cycle. In case of
          accidental charges or issues related to premium features, users can
          contact our support team within 7 days of payment for review.
        </p>
      </Section>

      <Section title="Privacy Policy">
        <p>
          We respect your privacy. Your data is securely stored using Firebase,
          and we never share your personal information with third parties.
          Emails and academic info are used only to personalize your experience.
        </p>
      </Section>

      <Section title="Support">
        <p>
          For any questions or concerns, feel free to contact us at:
          <br />
          📧{" "}
          <a
            href="mailto:help@studyconnect.live"
            className="text-blue-600 underline"
          >
            help@studyconnect.live
          </a>
        </p>
      </Section>

      <div className="text-center mt-10 text-gray-500 text-xs">
        Last updated: July 2025
      </div>
    </div>
  );
};

export default PoliciesPage;
