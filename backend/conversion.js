// conversion.js
// Handles conversion of uploaded files

const fs = require('fs');

/**
 * REAL GPA Conversion Logic
 * Converts percentage grades to 4.0 scale GPA
 * Supports various international grading systems
 */
function convertGPA(content) {
  try {
    const lines = content.split('\n');
    let convertedLines = [];
    let totalCredits = 0;
    let totalGradePoints = 0;
    let courseResults = [];

    for (let line of lines) {
      if (!line.trim()) continue;

      // Try to parse course data (various formats)
      const courseData = parseCourseData(line);
      
      if (courseData) {
        const { courseName, credits, grade, percentage } = courseData;
        const usGrade = convertToUSGrade(grade, percentage);
        const gradePoints = usGrade * credits;
        
        totalCredits += credits;
        totalGradePoints += gradePoints;
        
        courseResults.push({
          course: courseName,
          credits: credits,
          originalGrade: grade,
          percentage: percentage,
          usGrade: usGrade.toFixed(2),
          gradePoints: gradePoints.toFixed(2)
        });
        
        convertedLines.push(`${courseName} | Credits: ${credits} | Original: ${grade}${percentage ? ` (${percentage}%)` : ''} → US Grade: ${usGrade.toFixed(2)}`);
      } else {
        // If not course data, keep the line as is
        convertedLines.push(line);
      }
    }

    // Calculate overall GPA
    const overallGPA = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
    
    // Add summary
    convertedLines.push('\n=== GPA CONVERSION SUMMARY ===');
    convertedLines.push(`Total Credits: ${totalCredits}`);
    convertedLines.push(`Total Grade Points: ${totalGradePoints.toFixed(2)}`);
    convertedLines.push(`Overall GPA (4.0 scale): ${overallGPA.toFixed(2)}`);
    convertedLines.push(`Equivalent Percentage: ${convertGPAToPercentage(overallGPA).toFixed(1)}%`);
    
    // Add detailed course breakdown
    convertedLines.push('\n=== DETAILED COURSE BREAKDOWN ===');
    courseResults.forEach(course => {
      convertedLines.push(`${course.course}: ${course.credits} credits, ${course.originalGrade} → ${course.usGrade} (${course.gradePoints} pts)`);
    });

    return convertedLines.join('\n');
  } catch (error) {
    return `Error in GPA conversion: ${error.message}\n\nOriginal content:\n${content}`;
  }
}

/**
 * Parse course data from various formats
 */
function parseCourseData(line) {
  const patterns = [
    // Format: "Course Name, Credits, Grade"
    /^([^,]+),\s*(\d+(?:\.\d+)?),\s*([A-F][+-]?|\d+(?:\.\d+)?)/i,
    // Format: "Course Name - Credits - Grade"
    /^([^-]+)-\s*(\d+(?:\.\d+)?)\s*-\s*([A-F][+-]?|\d+(?:\.\d+)?)/i,
    // Format: "Course Name (Credits): Grade"
    /^([^(]+)\s*\((\d+(?:\.\d+)?)\):\s*([A-F][+-]?|\d+(?:\.\d+)?)/i,
    // Format with percentage: "Course Name: 85%"
    /^([^:]+):\s*(\d+(?:\.\d+)?)%/,
  ];

  for (let pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      const courseName = match[1].trim();
      const credits = parseFloat(match[2]) || 3.0; // Default to 3 credits
      const grade = match[3] ? match[3].trim() : null;
      const percentage = match[3] && !isNaN(match[3]) ? parseFloat(match[3]) : null;
      
      return { courseName, credits, grade, percentage };
    }
  }
  
  return null;
}

/**
 * Convert various grade systems to US 4.0 scale
 */
function convertToUSGrade(grade, percentage) {
  if (percentage !== null && !isNaN(percentage)) {
    // Convert percentage to 4.0 scale
    if (percentage >= 93) return 4.0;
    if (percentage >= 90) return 3.7;
    if (percentage >= 87) return 3.3;
    if (percentage >= 83) return 3.0;
    if (percentage >= 80) return 2.7;
    if (percentage >= 77) return 2.3;
    if (percentage >= 73) return 2.0;
    if (percentage >= 70) return 1.7;
    if (percentage >= 67) return 1.3;
    if (percentage >= 65) return 1.0;
    return 0.0;
  }

  // Convert letter grades
  const gradeMap = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };

  return gradeMap[grade?.toUpperCase()] || 0.0;
}

/**
 * Convert GPA back to percentage for reference
 */
function convertGPAToPercentage(gpa) {
  // Rough conversion - varies by institution
  if (gpa >= 4.0) return 97;
  if (gpa >= 3.7) return 93;
  if (gpa >= 3.3) return 89;
  if (gpa >= 3.0) return 85;
  if (gpa >= 2.7) return 82;
  if (gpa >= 2.3) return 78;
  if (gpa >= 2.0) return 75;
  if (gpa >= 1.7) return 72;
  if (gpa >= 1.3) return 69;
  if (gpa >= 1.0) return 65;
  return 60;
}

/**
 * REAL Medical Conversion Logic
 * Converts medical measurements and units
 */
function convertMedical(content) {
  try {
    const lines = content.split('\n');
    let convertedLines = [];
    let conversionSummary = [];

    const conversions = {
      // Lab values
      'glucose': { from: 'mg/dL', to: 'mmol/L', factor: 0.0555 },
      'cholesterol': { from: 'mg/dL', to: 'mmol/L', factor: 0.0259 },
      'creatinine': { from: 'mg/dL', to: 'μmol/L', factor: 88.4 },
      'bilirubin': { from: 'mg/dL', to: 'μmol/L', factor: 17.1 },
      'hemoglobin': { from: 'g/dL', to: 'g/L', factor: 10 },
      
      // Vital signs
      'temperature': { 
        fahrenheit: { to: 'celsius', formula: (f) => (f - 32) * 5/9 },
        celsius: { to: 'fahrenheit', formula: (c) => (c * 9/5) + 32 }
      },
      
      // Height/Weight
      'height': {
        inches: { to: 'cm', factor: 2.54 },
        cm: { to: 'inches', factor: 0.3937 }
      },
      'weight': {
        pounds: { to: 'kg', factor: 0.4536 },
        kg: { to: 'pounds', factor: 2.2046 }
      },
      
      // Blood pressure (just format conversion)
      'blood pressure': { from: 'mmHg', to: 'kPa', factor: 0.133 }
    };

    for (let line of lines) {
      if (!line.trim()) {
        convertedLines.push('');
        continue;
      }

      let convertedLine = line;
      let lineConversions = [];

      // Convert lab values
      for (const [test, conversion] of Object.entries(conversions)) {
        if (line.toLowerCase().includes(test)) {
          const valueMatch = line.match(/(\d+(?:\.\d+)?)\s*(mg\/dL|mmol\/L|g\/dL|g\/L|μmol\/L)/i);
          if (valueMatch) {
            const value = parseFloat(valueMatch[1]);
            const unit = valueMatch[2];
            
            if (unit.toLowerCase() === conversion.from) {
              const convertedValue = value * conversion.factor;
              convertedLine += ` → ${convertedValue.toFixed(2)} ${conversion.to}`;
              lineConversions.push(`${test}: ${value} ${unit} = ${convertedValue.toFixed(2)} ${conversion.to}`);
            }
          }
        }
      }

      // Convert temperature
      const tempMatch = line.match(/(\d+(?:\.\d+)?)\s*°?\s*([CF])/i);
      if (tempMatch) {
        const value = parseFloat(tempMatch[1]);
        const unit = tempMatch[2].toUpperCase();
        
        if (unit === 'F') {
          const celsius = (value - 32) * 5/9;
          convertedLine += ` → ${celsius.toFixed(1)}°C`;
          lineConversions.push(`Temperature: ${value}°F = ${celsius.toFixed(1)}°C`);
        } else if (unit === 'C') {
          const fahrenheit = (value * 9/5) + 32;
          convertedLine += ` → ${fahrenheit.toFixed(1)}°F`;
          lineConversions.push(`Temperature: ${value}°C = ${fahrenheit.toFixed(1)}°F`);
        }
      }

      // Convert height/weight
      const hwMatch = line.match(/(\d+(?:\.\d+)?)\s*(kg|lb|pounds?|cm|inches?|in)/i);
      if (hwMatch) {
        const value = parseFloat(hwMatch[1]);
        const unit = hwMatch[2].toLowerCase();
        
        if (['lb', 'pound', 'pounds'].includes(unit)) {
          const kg = value * 0.4536;
          convertedLine += ` → ${kg.toFixed(1)} kg`;
          lineConversions.push(`Weight: ${value} lb = ${kg.toFixed(1)} kg`);
        } else if (unit === 'kg') {
          const lb = value * 2.2046;
          convertedLine += ` → ${lb.toFixed(1)} lb`;
          lineConversions.push(`Weight: ${value} kg = ${lb.toFixed(1)} lb`);
        } else if (['in', 'inch', 'inches'].includes(unit)) {
          const cm = value * 2.54;
          convertedLine += ` → ${cm.toFixed(1)} cm`;
          lineConversions.push(`Height: ${value} in = ${cm.toFixed(1)} cm`);
        } else if (unit === 'cm') {
          const inches = value * 0.3937;
          convertedLine += ` → ${inches.toFixed(1)} in`;
          lineConversions.push(`Height: ${value} cm = ${inches.toFixed(1)} in`);
        }
      }

      convertedLines.push(convertedLine);
      conversionSummary.push(...lineConversions);
    }

    // Add conversion summary
    if (conversionSummary.length > 0) {
      convertedLines.push('\n=== MEDICAL CONVERSION SUMMARY ===');
      conversionSummary.forEach(conv => {
        convertedLines.push(`✓ ${conv}`);
      });
      
      convertedLines.push('\n=== COMMON REFERENCE RANGES ===');
      convertedLines.push('Glucose: 70-100 mg/dL (3.9-5.6 mmol/L)');
      convertedLines.push('Cholesterol: <200 mg/dL (<5.2 mmol/L)');
      convertedLines.push('Creatinine: 0.6-1.2 mg/dL (53-106 μmol/L)');
      convertedLines.push('Temperature: 98.6°F (37°C)');
      convertedLines.push('Hemoglobin: 12-16 g/dL (120-160 g/L)');
    }

    return convertedLines.join('\n');
  } catch (error) {
    return `Error in medical conversion: ${error.message}\n\nOriginal content:\n${content}`;
  }
}

/**
 * Generic conversion function
 */
function convertFile(type, filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File not found at path: " + filePath);
  }

  // Read file content as plain text
  const content = fs.readFileSync(filePath, "utf-8");
  let converted;

  if (type === "gpa") {
    converted = convertGPA(content);
  } else if (type === "medical") {
    converted = convertMedical(content);
  } else {
    throw new Error("Unknown conversion type: " + type);
  }

  return { original: content, converted };
}

module.exports = { convertGPA, convertMedical, convertFile };