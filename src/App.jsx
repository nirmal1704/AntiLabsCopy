import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import SEO from "./components/SEO";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustedBy from "./components/TrustedBy";
import Services from "./components/Services";

import WhyUs from "./components/WhyUs";
import Process from "./components/Process";
import Testimonials from "./components/Testimonials";
import CTABanner from "./components/CTABanner";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import CookieBanner from "./components/CookieBanner";
import { AuthModalProvider } from "./context/AuthModalContext";

// Lazy loaded pages
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const HacklabsPage = lazy(() => import("./pages/HacklabsPage"));
const HacklabsDashboardPage = lazy(
  () => import("./pages/HacklabsDashboardPage"),
);
const HacklabsRegisterPage = lazy(() => import("./pages/HacklabsRegisterPage"));
const HacklabsOnboardingPage = lazy(() => import("./pages/HacklabsOnboardingPage"));
const HacklabsAvatarPage = lazy(() => import("./pages/HacklabsAvatarPage"));
const HacklabsJudgeDashboard = lazy(() => import("./pages/HacklabsJudgeDashboard"));
const HacklabsAuthModal = lazy(() => import("./components/HacklabsAuthModal"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const BlogsPage = lazy(() => import("./pages/BlogsPage"));
const BlogSinglePage = lazy(() => import("./pages/BlogSinglePage"));

import "./App.css";

function HomePage() {
  return (
    <>
      <SEO isHome={true} canonicalUrl="/" />
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Services />

        <WhyUs />
        <Process />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}

// A simple loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <div
      className="loader"
      style={{
        width: "40px",
        height: "40px",
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #0ea5e9",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function App() {
  const location = useLocation();
  return (
    <>
      <ErrorBoundary>
        <AuthModalProvider>
          <ScrollToTop />
          <CookieBanner />
        <Suspense fallback={<PageLoader />}>
          <div
            className={
              location.pathname.startsWith("/hacklabs")
                ? "app app-dark"
                : "app app-light"
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/hacklabs" element={<HacklabsPage />} />
              <Route
                path="/hacklabs/dashboard"
                element={<HacklabsDashboardPage />}
              />
              <Route
                path="/hacklabs/register"
                element={<HacklabsRegisterPage />}
              />
              <Route
                path="/hacklabs/onboarding"
                element={<HacklabsOnboardingPage />}
              />
              <Route
                path="/hacklabs/id-card"
                element={<HacklabsAvatarPage />}
              />
              <Route
                path="/hacklabs/judge-dashboard"
                element={<HacklabsJudgeDashboard />}
              />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<TermsPage />} />
              <Route path="/refund" element={<TermsPage />} />
              <Route path="/employment" element={<TermsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/blogs/:slug" element={<BlogSinglePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <HacklabsAuthModal />
        </Suspense>
        </AuthModalProvider>
      </ErrorBoundary>
    </>
  );
}
