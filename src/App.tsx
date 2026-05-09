import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Impact from './components/Impact';
import Contact from './components/Contact';
import Header from './components/Header';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';

function App() {
  useEffect(() => {
    document.title = 'React Template Base';
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-neutral-900">
        <Header />

        <main>
          <Hero />
          <About />
          <Services />
          <Impact />
          <Contact />
        </main>

        <Footer />
        <BackToTopButton />
      </div>
    </ErrorBoundary>
  );
}

export default App;
