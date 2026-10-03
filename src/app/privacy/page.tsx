import React from "react";

const PrivacyPolicy: React.FC = () => {
  // CSS-in-JS for sizing/layout only (no colors)
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "2rem",
      lineHeight: 1.6 as number,
    },
    heading: {
      fontSize: "2rem",
      marginBottom: "1rem",
    },
    sectionHeading: {
      fontSize: "1.5rem",
      marginTop: "2rem",
      marginBottom: "1rem",
    },
    paragraph: {
      marginBottom: "1rem",
    },
    list: {
      marginBottom: "1rem",
      paddingLeft: "1.5rem",
    },
    nestedList: {
      listStyleType: "disc" as const,
      marginLeft: "1rem",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Privacy Policy</h1>
      <p style={styles.paragraph}>
        <strong>Last updated:</strong> May 31, 2025
      </p>

      <p style={styles.paragraph}>
        Welcome to ManoMed Ai. This Privacy Policy describes how we collect, use, disclose,
        and safeguard your information when you visit our website <strong>manomedai.com</strong> and use our medical
        questionnaire service within the <strong>ManoMed Ai application</strong>. By using the Service, you consent
        to the collection, use, and disclosure of your information as described in this Privacy Policy.
      </p>

      <h2 style={styles.sectionHeading}>1. Information We Collect</h2>
      <p style={styles.paragraph}>
        When you access and use our Service, we collect the following types of information:
      </p>
      <ul style={styles.list}>
        <li>
          <strong>Personal Identifiers and Contact Information.</strong>
          <ul style={styles.nestedList}>
            <li>Name</li>
            <li>Email address</li>
          </ul>
        </li>
        <li>
          <strong>Demographic Details.</strong>
          <ul style={styles.nestedList}>
            <li>Age</li>
            <li>Gender</li>
          </ul>
        </li>
        <li>
          <strong>Medical and Health Information.</strong>
          <ul style={styles.nestedList}>
            <li>Symptoms</li>
            <li>Medical history</li>
            <li>Answers to each questionnaire question</li>
          </ul>
        </li>
        <li>
          <strong>Generated Report Data.</strong>
          <ul style={styles.nestedList}>
            <li>Provisional diagnoses or expected illnesses resulting from your answers</li>
          </ul>
        </li>
      </ul>

      <h2 style={styles.sectionHeading}>2. How We Use Your Information</h2>
      <ul style={styles.list}>
        <li>
          <strong>Generating Medical Reports.</strong><br />
          To analyze your questionnaire answers and medical history in order to generate a structured clinical assessment report outlining potential diagnoses.
        </li>
        <li>
          <strong>Delivery of Reports.</strong><br />
          When you click “Download Report” or request an email dispatch, your generated report is delivered directly to your device and optionally sent to your specified recipient address.
        </li>
        <li>
          <strong>Improving Diagnostic Precision.</strong><br />
          To review anonymized, aggregate metrics so we can refine clinical triage decision logic and improve patient safety algorithms.
        </li>
        <li>
          <strong>Communications.</strong><br />
          To respond to your inquiries if you contact our clinical support team via email.
        </li>
        <li>
          <strong>Compliance and Safety.</strong><br />
          To comply with applicable laws, emergency safety notifications, and protect the rights and safety of users.
        </li>
      </ul>

      <h2 style={styles.sectionHeading}>3. How We Share Your Information</h2>
      <ul style={styles.list}>
        <li>
          <strong>Zero Sale of Personal Health Data.</strong><br />
          ManoMed AI never sells, rents, or commercializes personal identifiers or protected health records to third-party advertisers or brokers.
        </li>
        <li>
          <strong>Compliance with Laws.</strong><br />
          If required by law, regulation, or court subpoena, we may disclose strictly necessary records to regulatory authorities.
        </li>
        <li>
          <strong>Organizational Transfers.</strong><br />
          In the event of an institutional merger or acquisition, surviving entities remain bound by these privacy protections.
        </li>
      </ul>

      <h2 style={styles.sectionHeading}>4. How We Use Your Information (Platform Enhancement & Reflective Storage)</h2>
      <p style={styles.paragraph}>
        The information you provide through your interaction with the ManoMed Ai application is utilized solely to enhance the
        accuracy, relevance, and personalization of your diagnostic experience. When you opt to receive a generated report —
        typically by engaging the “Download Report” functionality — a derivative, non-identifiable copy of the analytical outcome
        may be securely mirrored to our internal systems for quality assurance, future algorithmic refinement, and service
        continuity purposes.
      </p>
      <p style={styles.paragraph}>
        This reflective storage is implemented in accordance with principles of data minimization and is not employed for any
        direct identification or unsolicited contact. Rather, it serves to reinforce the integrity and robustness of our
        health-tech infrastructure. We neither engage in commercial redistribution of personal data nor permit access to
        unauthorized third parties.
      </p>
      <p style={styles.paragraph}>
        In lay terms, your data is treated with the utmost discretion — utilized strictly in the context of platform improvement
        and safeguarded through procedural, organizational, and technical measures.
      </p>
      <p style={styles.paragraph}>
        All information transmitted between your device and our servers is protected using industry-standard SSL/TLS encryption.
      </p>

      <h2 style={styles.sectionHeading}>5. Children’s Privacy</h2>
      <p style={styles.paragraph}>
        Our Service is intended for general audiences and is not directed to children under the age of 13. We do not knowingly
        collect personally identifiable information from children under 13. If we become aware that a child under 13 has provided
        us with personal information, we will delete such data as quickly as possible. If you believe a child under 13 may have
        provided us with information, please contact us via email.
      </p>

      <h2 style={styles.sectionHeading}>6. Third-Party Services</h2>
      <p style={styles.paragraph}>
        At present, we do not integrate or share data with third-party analytics, advertising, or tracking services. We do not
        use tools such as Google Analytics, Facebook Pixel, or similar. Our hosting provider (Vercel) may collect minimal logs
        (such as access logs) strictly for hosting and performance purposes, but we do not consider that to be part of our
        privacy collection policies. If this changes in the future, we will update this Privacy Policy accordingly.
      </p>

      <h2 style={styles.sectionHeading}>7. No Account or Login Required</h2>
      <p style={styles.paragraph}>
        Currently, you are not required to create an account, sign in, or provide a password to use our Service. All users can
        access and complete the medical questionnaire directly without registration. In the future, if we add user accounts, we
        will update this Privacy Policy to explain how account data is collected, used, and secured.
      </p>

      <h2 style={styles.sectionHeading}>8. Retention of Your Information</h2>
      <p style={styles.paragraph}>
        We retain your personal information, questionnaire responses, and generated reports for as long as required to fulfill
        the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. If you
        wish to request deletion of your data, please contact us (see “Contact Us” below). We will respond to your request
        within a reasonable timeframe.
      </p>

      <h2 style={styles.sectionHeading}>9. Your Rights and Choices</h2>
      <p style={styles.paragraph}>
        Depending on your jurisdiction, you may have the following rights regarding your personal information:
      </p>
      <ul style={styles.list}>
        <li><strong>Access.</strong> You can request a copy of the personal data we hold about you.</li>
        <li><strong>Correction.</strong> You can ask us to correct or update any inaccurate or incomplete information.</li>
        <li><strong>Deletion.</strong> You can request that we delete your personal information from our systems, subject to legal exceptions.</li>
        <li><strong>Restriction.</strong> You can request that we restrict processing of your personal data under certain circumstances.</li>
        <li><strong>Objection.</strong> You can object to our processing of your personal data for direct marketing purposes (though we do not use your data for marketing).</li>
      </ul>
      <p style={styles.paragraph}>
        To exercise any of these rights, please contact us using the information in the “Contact Us” section below. We will
        respond to your request in a timely manner, consistent with applicable laws.
      </p>

      <h2 style={styles.sectionHeading}>10. Changes to This Privacy Policy</h2>
      <p style={styles.paragraph}>
        We may update this Privacy Policy from time to time. When we make material changes, we will revise the “Last updated”
        date at the top of this page. We encourage you to review this Privacy Policy periodically to stay informed about how
        we handle your information.
      </p>

      <h2 style={styles.sectionHeading}>11. Contact Us</h2>
      <p style={styles.paragraph}>
        If you have any questions, concerns, or requests regarding this Privacy Policy or our clinical data protection practices, please contact our Data Governance Officer at:
      </p>
      <ul style={styles.list}>
        <li><strong>Email:</strong> <a href="mailto:compliance@manomed.ai">compliance@manomed.ai</a></li>
        <li>
          <strong>Organizational Unit:</strong><br />
          ManoMed AI Clinical Intelligence Systems, Data Privacy & Regulatory Compliance Division.
        </li>
      </ul>
      <p style={styles.paragraph}>
        Please allow up to 3 business days for our privacy compliance team to respond to formal requests.
      </p>

      <h2 style={styles.sectionHeading}>12. Consent & Regulatory Compliance</h2>
      <p style={styles.paragraph}>
        By utilizing ManoMed AI, you acknowledge and consent to the processing and ephemeral storage of your health inputs as specified in this Privacy Policy.
      </p>
      <p style={styles.paragraph}>
        ManoMed AI operates in adherence with internationally recognized digital health privacy frameworks, including the European Union General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and HIPAA principles for protected health information transmission.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
