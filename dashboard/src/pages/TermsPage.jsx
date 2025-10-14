import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import '../css/TermsPage.css';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-page">
      <Container maxWidth="md" className="terms-page__container">
        <Paper elevation={3} className="terms-page__paper">
          <Box className="terms-page__header">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              className="terms-page__back-btn"
            >
              Back
            </Button>
            <Typography variant="h4" component="h1" className="terms-page__title">
              📋 ELako.Nv Terms and Agreement
            </Typography>
          </Box>

          <Box className="terms-page__content">
            <Typography variant="body2" className="terms-page__effective-date">
              <strong>Effective Date:</strong> September 5, 2025
            </Typography>

            <Typography variant="body2" className="terms-page__acceptance-note" style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <strong>Terms Acceptance:</strong> By signing up for ELako.Nv, you automatically accept these terms on the date of your account creation. This acceptance is recorded in your account information.
            </Typography>
            
            <Typography variant="body1" paragraph>
              Welcome to <strong>ELako.Nv</strong>, a digital marketing platform designed to help 
              Micro, Small, and Medium Enterprises (MSMEs) in Nueva Vizcaya promote and grow their 
              businesses online. By creating an account, accessing, or using our platform, you agree 
              to the terms below.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              1. Purpose of the Platform
            </Typography>
            <Typography variant="body2" paragraph>
              • ELako.Nv provides digital tools and services that allow MSMEs to showcase their products, 
              connect with customers, and enhance their visibility online.
              <br />
              • Our mission is to empower local businesses through innovative marketing solutions.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              2. Acceptance of Terms
            </Typography>
            <Typography variant="body2" paragraph>
              • By using ELako.Nv, you agree to follow these Terms and Agreement.
              <br />
              • If you do not agree with any part of these terms, please do not use the platform.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              3. Account Registration
            </Typography>
            <Typography variant="body2" paragraph>
              • You must provide accurate and up-to-date information during registration.
              <br />
              • You are responsible for keeping your login details secure.
              <br />
              • ELako.Nv reserves the right to suspend or remove accounts that contain false information, 
              are inactive, or violate our policies.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              4. User Responsibilities
            </Typography>
            <Typography variant="body2" paragraph>
              All users, including MSME owners and customers, agree to:
              <br />
              • Use the system only for lawful and legitimate purposes.
              <br />
              • Avoid posting false, harmful, or misleading content.
              <br />
              • Not upload materials containing viruses, spam, or offensive language.
              <br />
              • Respect the rights of other users and businesses.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              5. Content Ownership and Usage
            </Typography>
            <Typography variant="body2" paragraph>
              • MSME owners retain full ownership of the content they upload (e.g., photos, logos, descriptions).
              <br />
              • By uploading content, you allow ELako.Nv to display and promote it within the platform 
              for marketing or system purposes.
              <br />
              • ELako.Nv may remove content that violates these terms or contains inappropriate material.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              6. Intellectual Property
            </Typography>
            <Typography variant="body2" paragraph>
              • All platform elements, including the ELako.Nv logo, layout, and system features, 
              are owned by ELako.Nv.
              <br />
              • No one is allowed to copy, modify, or distribute any part of the platform without permission.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              7. Privacy Policy
            </Typography>
            
            <Typography variant="subtitle1" className="terms-page__subsection-title">
              a. Information We Collect
            </Typography>
            <Typography variant="body2" paragraph>
              We may collect:
              <br />
              • Account details (name, email, business name, address, etc.)
              <br />
              • Uploaded content (product images, descriptions, and business info)
              <br />
              • Technical information (browser type, device, and usage data)
            </Typography>

            <Typography variant="subtitle1" className="terms-page__subsection-title">
              b. How We Use Your Information
            </Typography>
            <Typography variant="body2" paragraph>
              Your information is used to:
              <br />
              • Operate and improve the platform
              <br />
              • Personalize your experience
              <br />
              • Send updates, announcements, or technical notices
              <br />
              • Promote MSME visibility within the platform
            </Typography>

            <Typography variant="subtitle1" className="terms-page__subsection-title">
              c. Data Sharing
            </Typography>
            <Typography variant="body2" paragraph>
              • We do not sell or rent your information to third parties.
              <br />
              • Data may only be shared with authorized administrators or when required by law.
            </Typography>

            <Typography variant="subtitle1" className="terms-page__subsection-title">
              d. Data Security
            </Typography>
            <Typography variant="body2" paragraph>
              • ELako.Nv uses reasonable security measures to protect your information.
              <br />
              • However, no system can guarantee 100% security. Please protect your password and account access.
            </Typography>

            <Typography variant="subtitle1" className="terms-page__subsection-title">
              e. User Rights
            </Typography>
            <Typography variant="body2" paragraph>
              You have the right to:
              <br />
              • View or update your personal data
              <br />
              • Request account deletion by contacting our support team
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              8. Service Availability
            </Typography>
            <Typography variant="body2" paragraph>
              • ELako.Nv strives to keep the system running smoothly.
              <br />
              • However, temporary downtime may occur due to maintenance, updates, or technical issues.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              9. Limitation of Liability
            </Typography>
            <Typography variant="body2" paragraph>
              ELako.Nv is not responsible for:
              <br />
              • Technical issues, downtime, or data loss
              <br />
              • Content posted by users
              <br />
              • Misuse or unauthorized access caused by user negligence
              <br />
              • Use of the platform is at your own risk.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              10. Termination
            </Typography>
            <Typography variant="body2" paragraph>
              ELako.Nv may suspend or delete accounts that:
              <br />
              • Violate these Terms
              <br />
              • Spread false or harmful content
              <br />
              • Attempt to compromise system security
              <br />
              • Users may also request deletion of their account at any time.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              11. Updates to Terms
            </Typography>
            <Typography variant="body2" paragraph>
              • These Terms and the Privacy Policy may be updated periodically.
              <br />
              • Users will be notified of major changes through the system or email.
              <br />
              • Continued use of the platform means acceptance of the updated terms.
            </Typography>

            <Typography variant="h6" className="terms-page__section-title">
              12. Contact Information
            </Typography>
            <Typography variant="body2" paragraph>
              If you have questions or concerns about these Terms or our Privacy Policy, please contact us:
              <br />
              📩 <strong>elakonv@gmail.com</strong>
              <br />
              📍 <strong>Nueva Vizcaya, Philippines</strong>
            </Typography>
          </Box>

          <Box className="terms-page__footer">
            <Typography variant="body2" color="textSecondary" align="center">
              © 2025 ELako.Nv. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default TermsPage;