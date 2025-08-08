// Debug script to check analysis data structure
const analysisData = localStorage.getItem('atsAnalysisResult');

if (analysisData) {
    try {
        const data = JSON.parse(analysisData);
        console.log('=== ANALYSIS DATA STRUCTURE ===');
        console.log('Overall Structure:', Object.keys(data));
        
        console.log('\n=== FEEDBACK STRUCTURE ===');
        if (data.feedback) {
            console.log('Feedback Keys:', Object.keys(data.feedback));
            
            // Check if AI Analysis exists
            if (data.feedback['AI Analysis']) {
                console.log('\n=== AI ANALYSIS FOUND ===');
                console.log('AI Analysis:', data.feedback['AI Analysis']);
            } else {
                console.log('\n=== AI ANALYSIS NOT FOUND ===');
                console.log('Available feedback categories:', Object.keys(data.feedback));
            }
        } else {
            console.log('No feedback object found');
        }
        
        console.log('\n=== DETAILED INSIGHTS ===');
        if (data.detailed_insights) {
            console.log('Detailed Insights Keys:', Object.keys(data.detailed_insights));
        } else {
            console.log('No detailed_insights found');
        }
        
        console.log('\n=== FULL DATA ===');
        console.log(JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('Error parsing analysis data:', error);
    }
} else {
    console.log('No analysis data found in localStorage');
}
