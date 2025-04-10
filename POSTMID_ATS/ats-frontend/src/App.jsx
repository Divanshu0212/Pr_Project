import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfessionSelector from './components/ProfessionSelector';
import ResumeUploader from './components/ResumeUploader';
import ResultsDisplay from './components/ResultsDisplay';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [profession, setProfession] = useState('');
  const [keywords, setKeywords] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleProfessionSubmit = async (selectedProfession) => {
    try {
      setLoading(true);
      setProfession(selectedProfession);
      
      const response = await fetch('http://localhost:5000/api/profession-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profession: selectedProfession }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch keywords');
      }
      
      const data = await response.json();
      setKeywords(data.keywords);
      setStep(2);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      alert('Failed to fetch keywords. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSubmit = async (file) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('keywords', JSON.stringify(keywords));
      
      const response = await fetch('http://localhost:5000/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }
      
      const data = await response.json();
      setResults(data);
      setStep(3);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetApplication = () => {
    setProfession('');
    setKeywords(null);
    setResults(null);
    setStep(1);
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Processing your request...</p>
          </div>
        )}

        {step === 1 && (
          <ProfessionSelector onSubmit={handleProfessionSubmit} />
        )}
        
        {step === 2 && keywords && (
          <ResumeUploader 
            profession={profession} 
            keywords={keywords} 
            onSubmit={handleResumeSubmit} 
            onBack={() => setStep(1)}
          />
        )}
        
        {step === 3 && results && (
          <ResultsDisplay 
            results={results} 
            profession={profession}
            keywords={keywords}
            onReset={resetApplication}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;