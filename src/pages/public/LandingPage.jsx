import PublicNavbar from '../../components/layout/PublicNavbar'
import HeroSection from '../../components/landing/HeroSection'
import StatsSection from '../../components/landing/StatsSection'
import AboutSection from '../../components/landing/AboutSection'
import FacilitiesSection from '../../components/landing/FacilitiesSection'
import AcademicProgramsSection from '../../components/landing/AcademicProgramsSection'
import NoticeBoardSection from '../../components/landing/NoticeBoardSection'
import GallerySection from '../../components/landing/GallerySection'
import ContactSection from '../../components/landing/ContactSection'
import Footer from '../../components/layout/Footer'

const LandingPage = () => (
  <div className="min-h-screen">
    <PublicNavbar />
    <HeroSection />
    <StatsSection />
    <AboutSection />
    <FacilitiesSection />
    <AcademicProgramsSection />
    <NoticeBoardSection />
    <GallerySection />
    <ContactSection />
    <Footer />
  </div>
)

export default LandingPage
