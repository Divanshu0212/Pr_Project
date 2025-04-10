import { useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './styles/ResultsDisplay.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function ResultsDisplay({ results, profession, keywords, onReset }) {
  const scoreColor = getScoreColor(results.total_score);
  const chartRef = useRef(null);

  function getScoreColor(score) {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FFC107';
    if (score >= 40) return '#FF9800';
    return '#F44336';
  }

  const scoreData = {
    labels: ['Keywords & Relevance (40%)', 'Format & Structure (30%)', 'Achievements & Data (30%)'],
    datasets: [
      {
        data: [results.keyword_score, results.format_score, results.achievements_score],
        backgroundColor: ['#3498db', '#9b59b6', '#2ecc71'],
        borderColor: ['#2980b9', '#8e44ad', '#27ae60'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue || 0;
            const maxValue = label.includes('Keywords') ? 40 : 30;
            return `${label}: ${value} / ${maxValue}`;
          }
        }
      }
    }
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    // Keywords recommendations
    if (results.keyword_score < 30) {
      recommendations.push({
        title: "Improve Keyword Optimization",
        details: "Your resume is missing important keywords that recruiters and ATS systems look for.",
        actionItems: [
          "Add more industry-specific terms from the missing keywords list below",
          "Replace generic verbs with industry-specific action words",
          "Include relevant technical skills and certifications"
        ]
      });
    }
    
    // Format recommendations
    if (results.format_score < 20) {
      recommendations.push({
        title: "Enhance Resume Structure",
        details: "The formatting of your resume could be improved for better ATS readability.",
        actionItems: [
          "Use clear section headings (Experience, Education, Skills, etc.)",
          "Implement consistent date formats throughout",
          "Use bullet points for listing achievements and responsibilities",
          "Ensure contact information is complete and properly formatted"
        ]
      });
    }
    
    // Achievements recommendations
    if (results.achievements_score < 20) {
      recommendations.push({
        title: "Strengthen Achievements",
        details: "Your resume would benefit from more quantifiable achievements.",
        actionItems: [
          "Include specific numbers and percentages when describing accomplishments",
          "Use strong action verbs at the beginning of bullet points",
          "Demonstrate the impact of your work with measurable results",
          "Focus on outcomes rather than responsibilities"
        ]
      });
    }
    
    return recommendations;
  };

  return (
    <div className="results-display">
      <div className="card results-card">
        <h2>ATS Analysis Results</h2>
        <p className="profession-display">Profession: <strong>{profession}</strong></p>
        
        <div className="score-overview">
          <div className="score-circle" style={{ borderColor: scoreColor }}>
            <div className="score-number" style={{ color: scoreColor }}>
              {results.total_score}
            </div>
            <div className="score-label">ATS Score</div>
          </div>
          
          <div className="chart-container">
            <Doughnut ref={chartRef} data={scoreData} options={chartOptions} />
          </div>
        </div>
        
        <div className="score-breakdown">
          <h3>Score Breakdown</h3>
          <div className="breakdown-items">
            <div className="breakdown-item">
              <div className="breakdown-label">Keywords & Relevance</div>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-progress" 
                  style={{ width: `${(results.keyword_score / 40) * 100}%`, backgroundColor: '#3498db' }}
                ></div>
              </div>
              <div className="breakdown-score">{results.keyword_score}/40</div>
            </div>
            
            <div className="breakdown-item">
              <div className="breakdown-label">Format & Structure</div>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-progress" 
                  style={{ width: `${(results.format_score / 30) * 100}%`, backgroundColor: '#9b59b6' }}
                ></div>
              </div>
              <div className="breakdown-score">{results.format_score}/30</div>
            </div>
            
            <div className="breakdown-item">
              <div className="breakdown-label">Achievements & Data</div>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-progress" 
                  style={{ width: `${(results.achievements_score / 30) * 100}%`, backgroundColor: '#2ecc71' }}
                ></div>
              </div>
              <div className="breakdown-score">{results.achievements_score}/30</div>
            </div>
          </div>
        </div>
        
        <div className="recommendations-section">
          <h3>Recommendations to Improve Your Score</h3>
          <div className="recommendations-list">
            {getRecommendations().map((rec, index) => (
              <div key={index} className="recommendation-item">
                <h4>{rec.title}</h4>
                <p>{rec.details}</p>
                <ul>
                  {rec.actionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="keywords-analysis">
          <h3>Keywords Analysis</h3>
          
          <div className="keywords-found">
            <h4>Keywords Found ({results.detailed_analysis.keywords_found.length})</h4>
            <div className="keyword-tags">
              {results.detailed_analysis.keywords_found.length > 0 ? (
                results.detailed_analysis.keywords_found.map((keyword, index) => (
                  <span key={index} className="keyword-tag found">{keyword}</span>
                ))
              ) : (
                <p className="no-keywords">No keywords found in your resume</p>
              )}
            </div>
          </div>
          
          <div className="keywords-missing">
            <h4>Missing Keywords ({results.detailed_analysis.missing_keywords.length})</h4>
            <div className="keyword-tags">
              {results.detailed_analysis.missing_keywords.length > 0 ? (
                results.detailed_analysis.missing_keywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag missing">{keyword}</span>
                ))
              ) : (
                <p className="no-keywords">Great job! You've included all recommended keywords.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="reset-button" onClick={onReset}>
            Analyze Another Resume
          </button>
          <button className="download-button">
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsDisplay;

